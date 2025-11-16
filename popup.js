// Helper to display status messages in the popup
function setStatus(message, isError = false) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.classList.toggle('error', isError);
    statusDiv.classList.toggle('success', !isError && (message.startsWith('Updated') || message.startsWith('Highlighted')));
}

// Helper to process the response from the content script
function handleResponse(action, response) {
    if (response) {
        if (response.error) {
            setStatus(`Error: ${response.error}`, true);
        } else {
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
    } else if (chrome.runtime.lastError) {
        setStatus("Error: Cannot connect. Please reload the page and try again.", true);
        console.error(chrome.runtime.lastError.message);
    } else {
        setStatus('Error: Received an empty response from the page.', true);
    }
}

// The main function to communicate with the content script
async function sendMessageToContentScript(action) {
    setStatus('Working...');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
        setStatus('Error: Could not find active tab.', true);
        return;
    }

    try {
        // 1. First attempt: Assume script is already injected by the manifest.
        const response = await chrome.tabs.sendMessage(tab.id, { action });
        handleResponse(action, response);
    } catch (e) {
        // 2. Failure: The content script is not there.
        if (e.message && e.message.includes("Receiving end does not exist")) {
            console.warn("Content script not ready. Injecting programmatically.");
            setStatus('Initializing connection...');
            
            try {
                // 3. Inject scripts programmatically as a fallback.
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['utils.js', 'content_script.js'],
                });

                // 4. Retry sending the message.
                const response = await chrome.tabs.sendMessage(tab.id, { action });
                handleResponse(action, response);
            } catch (retryError) {
                console.error("Failed to send message after injection:", retryError);
                setStatus("Error: Failed to connect after retry. Please reload the page.", true);
            }
        } else {
            console.error('Extension error:', e);
            setStatus(`An unexpected error occurred: ${e.message}`, true);
        }
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