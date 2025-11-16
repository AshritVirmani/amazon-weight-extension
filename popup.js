// Helper to display status messages in the popup
function setStatus(message, isError = false) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.classList.toggle('error', isError);
    statusDiv.classList.toggle('success', !isError && (message.startsWith('Updated') || message.startsWith('Highlighted')));
}

// Helper to ensure content scripts are injected before sending messages
async function ensureContentScriptsInjected(tabId) {
    // First, try to ping to see if content script is already there
    try {
        await chrome.tabs.sendMessage(tabId, { action: 'ping' });
        return true; // Content script is already injected and ready
    } catch (e) {
        // Ignore ping errors - content script not available, we'll inject it
    }
    
    // Content script not available, inject it
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['utils.js', 'content_script.js']
        });
        
        // Wait for scripts to initialize and verify they're ready
        for (let i = 0; i < 5; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            try {
                await chrome.tabs.sendMessage(tabId, { action: 'ping' });
                return true; // Scripts are now ready
            } catch (pingError) {
                // Not ready yet, continue waiting
                if (i === 4) {
                    // Last attempt failed
                    if (chrome.runtime.lastError) {
                        console.error('Content scripts injected but not responding:', chrome.runtime.lastError.message);
                    } else {
                        console.error('Content scripts injected but not responding');
                    }
                    return false;
                }
            }
        }
        return false;
    } catch (injectError) {
        if (chrome.runtime.lastError) {
            console.error('Failed to inject content scripts:', chrome.runtime.lastError.message);
        } else {
            console.error('Failed to inject content scripts:', injectError);
        }
        return false;
    }
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

        // Ensure content scripts are injected
        const injected = await ensureContentScriptsInjected(tab.id);
        if (!injected) {
            setStatus('Error: Could not inject scripts. Try reloading the tab.', true);
            return;
        }

        let response;
        try {
            response = await chrome.tabs.sendMessage(tab.id, { action });
        } catch (messageError) {
            // Check for Chrome extension API errors
            if (chrome.runtime.lastError) {
                setStatus(`Error: ${chrome.runtime.lastError.message}. Try reloading the tab.`, true);
            } else {
                setStatus('Error: Could not communicate with page. Try reloading the tab.', true);
            }
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