// Helper to display status messages in the popup
function setStatus(message, isError = false) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.classList.toggle('error', isError);
    statusDiv.classList.toggle('success', !isError && (message.startsWith('Updated') || message.startsWith('Highlighted')));
}

// Helper to ensure content script is ready (inject if needed)
async function ensureContentScriptReady(tabId) {
    // First, try a quick ping to see if it's already there
    try {
        const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
        if (response && response.status === 'ready') {
            return true;
        }
    } catch (e) {
        // Content script not found, that's okay - we'll inject it
    }
    
    // Clear any lastError before proceeding
    if (chrome.runtime.lastError) {
        chrome.runtime.lastError; // Access it to clear it
    }
    
    // Inject the scripts
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['utils.js', 'content_script.js']
        });
    } catch (injectError) {
        // If injection fails, check the error
        if (chrome.runtime.lastError) {
            console.error('Failed to inject scripts:', chrome.runtime.lastError.message);
        }
        return false;
    }
    
    // Wait for scripts to initialize and verify they're ready
    for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Clear lastError before each attempt
        if (chrome.runtime.lastError) {
            chrome.runtime.lastError; // Access to clear
        }
        
        try {
            const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
            if (response && response.status === 'ready') {
                return true;
            }
        } catch (e) {
            // Not ready yet, continue waiting
            if (i === 4) {
                return false; // Last attempt failed
            }
        }
    }
    
    return false;
}

// Helper to send a message to the content script and handle the response
async function sendMessageToContentScript(action) {
    setStatus('Working...');
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Check if the tab is an Amazon Seller Central page
        if (!tab.url || !tab.url.startsWith('https://sellercentral.amazon.')) {
            setStatus('Error: Not an Amazon Seller Central page.', true);
            return;
        }

        // Ensure content script is ready (will inject if needed)
        const ready = await ensureContentScriptReady(tab.id);
        if (!ready) {
            setStatus('Error: Could not load extension scripts. Please reload the page.', true);
            return;
        }

        // Clear any lastError before sending message
        if (chrome.runtime.lastError) {
            chrome.runtime.lastError; // Access to clear
        }

        let response;
        try {
            response = await chrome.tabs.sendMessage(tab.id, { action });
        } catch (messageError) {
            // Check for Chrome extension API errors
            const errorMsg = chrome.runtime.lastError ? chrome.runtime.lastError.message : 'Unknown error';
            setStatus(`Error: ${errorMsg}. Please reload the page.`, true);
            console.error('Error sending message:', messageError);
            return;
        }
        
        if (response) {
            if (response.error) {
                setStatus(`Error: ${response.error}`, true);
            } else {
                // Handle different successful responses
                if (action === 'fillWeights') {
                    const { weightCount = 0, dimensionCount = 0 } = response;
                    const msg = `Updated: ${weightCount} weight(s), ${dimensionCount} dimension(s).`;
                    setStatus(weightCount > 0 || dimensionCount > 0 ? msg : 'No fields found to update.');
                } else if (action.startsWith('highlightAnomalies')) {
                    const { 
                        totalHighlighted = 0, 
                        multiOrderCount = 0, 
                        sizeAnomalyCount = 0,
                        weightUpdatedCount = 0,
                        dimensionsUpdatedCount = 0,
                        skippedUnframedCount = 0
                    } = response;

                    let parts = [`Highlighted: ${totalHighlighted} total`];
                    if (multiOrderCount > 0) parts.push(`${multiOrderCount} orders (>4 products)`);
                    if (sizeAnomalyCount > 0) parts.push(`${sizeAnomalyCount} size anomalies`);
                    
                    let updateMsg = '';
                    if (weightUpdatedCount > 0) updateMsg += `${weightUpdatedCount} weights updated. `;
                    if (skippedUnframedCount > 0) updateMsg += `${skippedUnframedCount} unframed items skipped.`;

                    let finalMsg = parts.join(', ') + '.';
                    if (updateMsg) finalMsg += ` ${updateMsg}`;
                    
                    setStatus(totalHighlighted > 0 ? finalMsg : 'No anomalies found to highlight.');
                }
            }
        } else {
            setStatus('Error: No response from page. Try reloading the tab.', true);
        }
    } catch (e) {
        setStatus('Error: Cannot access this page. Try reloading the tab.', true);
        console.error('Extension error:', e);
    }
}

// Add event listeners to buttons
document.getElementById('fillWeightsBtn').addEventListener('click', () => {
    sendMessageToContentScript('fillWeights');
});

document.getElementById('highlightAnomaliesBtn').addEventListener('click', () => {
    sendMessageToContentScript('highlightAnomalies');
});

document.getElementById('highlightAnomaliesOrdersBtn').addEventListener('click', () => {
    sendMessageToContentScript('highlightAnomaliesOrders');
});