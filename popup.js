// Helper to display status messages in the popup
function setStatus(message) {
    document.getElementById('status').textContent = message;
}

// Helper to send a message to the content script and handle the response
async function sendMessageToContentScript(action) {
    setStatus('Working...');
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Check if the tab is an Amazon Seller Central page
        if (!tab.url || !tab.url.startsWith('https://sellercentral.amazon.')) {
            setStatus('Error: Not an Amazon Seller Central page.');
            return;
        }

        const response = await chrome.tabs.sendMessage(tab.id, { action });
        
        if (response) {
            if (response.error) {
                setStatus(`Error: ${response.error}`);
            } else {
                // Handle different successful responses
                if (action === 'fillWeights') {
                    const { weightCount = 0, dimensionCount = 0 } = response;
                    const msg = `Updated: ${weightCount} weight(s), ${dimensionCount} dimension(s).`;
                    setStatus(weightCount > 0 || dimensionCount > 0 ? msg : 'No fields found to update.');
                } else if (action.startsWith('highlightAnomalies')) {
                    const { totalHighlighted = 0, multiOrderCount = 0, sizeAnomalyCount = 0 } = response;
                    const msg = `Highlighted: ${totalHighlighted} total anomalies (${multiOrderCount} multi-order, ${sizeAnomalyCount} size).`;
                    setStatus(totalHighlighted > 0 ? msg : 'No anomalies found to highlight.');
                }
            }
        } else {
            // This can happen if the content script is not injected yet.
            setStatus('Error: Could not connect to the page. Try reloading the tab.');
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError.message);
            }
        }
    } catch (e) {
        setStatus('Error: Cannot access this page. Try reloading the tab.');
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