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

// The main function to execute logic on the content page
async function executeActionOnPage(action) {
    setStatus('Working...');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
        setStatus('Error: Could not find active tab.', true);
        return;
    }

    if (!tab.url || !tab.url.startsWith('https://sellercentral.amazon.')) {
        setStatus('Error: Not an Amazon Seller Central page.', true);
        return;
    }

    try {
        // Step 1: Inject the necessary scripts. This is idempotent; scripts won't be re-injected if already present.
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['utils.js', 'content_script.js'],
        });

        // Step 2: Execute a function on the page to run our logic and get the result.
        const injectionResults = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: async (actionToPerform) => {
                // This function is executed in the page's context and has access to functions 
                // from the injected scripts.
                try {
                    if (actionToPerform === 'fillWeights') {
                        return await handleFillWeights();
                    } else if (actionToPerform === 'highlightAnomalies') {
                        return await handleHighlightAnomalies(false);
                    } else if (actionToPerform === 'highlightAnomaliesOrders') {
                        return await handleHighlightAnomalies(true);
                    }
                } catch (e) {
                    return { error: e.toString() }; // Ensure error is serializable
                }
            },
            args: [action],
        });

        if (injectionResults && injectionResults.length > 0) {
            const response = injectionResults[0].result;
            handleResponse(action, response);
        } else {
            setStatus('Error: No response from the page after execution.', true);
        }

    } catch (error) {
        console.error("Failed to execute script:", error);
        setStatus(`Injection failed: ${error.message}. Try reloading the page.`, true);
    }
}

// Add event listeners to buttons
document.getElementById('fillWeightsBtn').addEventListener('click', () => {
    executeActionOnPage('fillWeights');
});

document.getElementById('highlightAnomaliesBtn').addEventListener('click', () => {
    executeActionOnPage('highlightAnomalies');
});

document.getElementById('highlightAnomaliesOrdersBtn').addEventListener('click', () => {
    executeActionOnPage('highlightAnomaliesOrders');
});