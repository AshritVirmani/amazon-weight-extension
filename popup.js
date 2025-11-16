// Helper to display status messages in the popup
function setStatus(message, isError = false) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.classList.toggle('error', isError);
    statusDiv.classList.toggle('success', !isError && (message.startsWith('Updated') || message.startsWith('Highlighted')));
}

// Helper to send a message to the content script and handle the response
async function sendMessageToContentScript(action) {
    setStatus('Working...');
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab || !tab.id) {
            setStatus('Error: Could not find active tab.', true);
            return;
        }

        // Check if the tab is an Amazon Seller Central page
        if (!tab.url || !tab.url.startsWith('https://sellercentral.amazon.')) {
            setStatus('Error: Not an Amazon Seller Central page.', true);
            return;
        }

        // Programmatically inject the scripts.
        // The content script is written to be idempotent (it won't add duplicate listeners).
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['utils.js', 'content_script.js'],
            });
        } catch (e) {
            setStatus('Error: Failed to inject script. See console for details.', true);
            console.error('Injection error:', e);
            return;
        }


        // Now that scripts are guaranteed to be there, send the message.
        const response = await chrome.tabs.sendMessage(tab.id, { action });
        
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