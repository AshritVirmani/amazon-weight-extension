// Helper to display status messages in the popup
function setStatus(message, isError = false) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.classList.toggle('error', isError);
    statusDiv.classList.toggle('success', !isError && (message.startsWith('Updated') || message.startsWith('Highlighted')));
}

// Helper to wait for content script to be ready (it should auto-inject from manifest.json)
async function waitForContentScript(tabId, maxRetries = 5) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
            if (response && response.status === 'ready') {
                return true;
            }
        } catch (e) {
            // Content script not ready yet
            if (i === maxRetries - 1) {
                // Last attempt failed, try injecting manually as fallback
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: ['utils.js', 'content_script.js']
                    });
                    // Wait a bit for injection
                    await new Promise(resolve => setTimeout(resolve, 300));
                    // Try one more ping
                    try {
                        await chrome.tabs.sendMessage(tabId, { action: 'ping' });
                        return true;
                    } catch (finalError) {
                        return false;
                    }
                } catch (injectError) {
                    return false;
                }
            } else {
                // Wait and retry
                await new Promise(resolve => setTimeout(resolve, 200));
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

        // Wait for content script to be ready (auto-injected from manifest.json)
        const ready = await waitForContentScript(tab.id);
        if (!ready) {
            setStatus('Error: Content script not ready. Please reload the page and try again.', true);
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