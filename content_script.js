// This script is injected into the Amazon Seller Central pages.
// It listens for messages from the popup and performs actions on the page.

/**
 * Main function to handle filling weights and dimensions.
 * This will be triggered by a message from the popup.
 * @returns {object} A result object with counts of updated fields.
 */
async function handleFillWeights() {
    let weightCount = 0;
    let dimensionCount = 0;
    const dimensions = { length: '32', width: '24', height: '2.5' };
    const weightValue = '410';

    // A more resilient selector strategy
    const weightSelectors = [
        'kat-input[unique-id*="katal-id-"]',
        'kat-input[data-testid*="weight"]',
    ];
    const dimensionSelectors = {
        length: 'kat-input[data-testid="length-input"]',
        width: 'kat-input[data-testid="width-input"]',
        height: 'kat-input[data-testid="height-input"]',
    };

    // Find and fill weight fields
    for (const selector of weightSelectors) {
        const elements = findAllElements(selector);
        for (const el of elements) {
            const testId = (el.getAttribute('data-testid') || '').toLowerCase();
            // Ensure it's not a dimension field
            if (!testId.includes('length') && !testId.includes('width') && !testId.includes('height')) {
                const input = getInputFromKatInput(el);
                if (setInputValue(input, weightValue, el)) {
                    weightCount++;
                    await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
                }
            }
        }
    }

    // Find and fill dimension fields
    for (const [key, selector] of Object.entries(dimensionSelectors)) {
        const elements = findAllElements(selector);
        for (const el of elements) {
            const input = getInputFromKatInput(el);
            if (setInputValue(input, dimensions[key], el)) {
                dimensionCount++;
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
    }
    
    if (weightCount === 0 && dimensionCount === 0) {
        return { error: "Could not find any weight or dimension fields." };
    }

    return { weightCount, dimensionCount };
}

/**
 * Finds and updates the weight and dimension fields within a specific product row.
 * @param {Element} productRow - The container element for a single product.
 * @returns {object} An object with counts of updated fields.
 */
async function updateProductFields(productRow) {
    const weightValue = '890';
    const dimensions = { length: '50', width: '30', height: '2.9' };
    let weightUpdated = false;
    let dimensionsUpdated = 0;

    // Find and update weight field within the row
    const weightInputEl = findAllElements('kat-input[data-testid*="weight"]', productRow)[0];
    if (weightInputEl) {
        const input = getInputFromKatInput(weightInputEl);
        if (setInputValue(input, weightValue, weightInputEl)) {
            weightUpdated = true;
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    // Find and update dimension fields
    const lengthEl = findAllElements('kat-input[data-testid="length-input"]', productRow)[0];
    if (lengthEl) {
        const input = getInputFromKatInput(lengthEl);
        if (setInputValue(input, dimensions.length, lengthEl)) {
            dimensionsUpdated++;
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
    const widthEl = findAllElements('kat-input[data-testid="width-input"]', productRow)[0];
    if (widthEl) {
        const input = getInputFromKatInput(widthEl);
        if (setInputValue(input, dimensions.width, widthEl)) {
            dimensionsUpdated++;
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
    const heightEl = findAllElements('kat-input[data-testid="height-input"]', productRow)[0];
    if (heightEl) {
        const input = getInputFromKatInput(heightEl);
        if (setInputValue(input, dimensions.height, heightEl)) {
            dimensionsUpdated++;
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
    
    return { weightUpdated, dimensionsUpdated };
}


/**
 * Main function to handle highlighting anomalies.
 * This will be triggered by a message from the popup.
 * @returns {object} A result object with counts of highlighted anomalies.
 */
async function handleHighlightAnomalies(isOrdersPage = false) {
    clearAllHighlights();

    // Start by finding all product titles, as they are a reliable entry point.
    const productTitles = findAllElements('span[data-testid="line-item-title"], .myo-list-orders-product-name-cell a');
    if (productTitles.length === 0) {
        return { error: "Could not find any product titles on this page." };
    }

    // Group products by their containing row and order ID
    const orderProducts = {};
    const productRows = new Map(); // Map<Element, {title: string, orderId: string, isUnframed: boolean}>

    for (const titleElement of productTitles) {
        const productRow = findProductRow(titleElement);
        if (!productRow) continue;

        const orderId = findOrderId(productRow);
        const titleText = (titleElement.textContent || '').toLowerCase();

        // Store unique product rows with their metadata
        if (orderId && !productRows.has(productRow)) {
            if (!orderProducts[orderId]) {
                orderProducts[orderId] = [];
            }
            orderProducts[orderId].push(productRow);

            productRows.set(productRow, {
                title: titleText,
                orderId: orderId,
                isUnframed: titleText.includes('unframed') || titleText.includes('tape')
            });
        }
    }

    const multiOrderProducts = new Set();
    const sizeAnomalyProducts = new Set();
    
    // Identify multi-order products
    for (const orderId in orderProducts) {
        if (orderProducts[orderId].length > 1) {
            orderProducts[orderId].forEach(row => multiOrderProducts.add(row));
        }
    }

    // Identify size anomaly products
    for (const [row, data] of productRows.entries()) {
        if (hasSizeAnomaly(row)) {
            sizeAnomalyProducts.add(row);
        }
    }

    let weightUpdatedCount = 0;
    let dimensionsUpdatedCount = 0;
    let skippedUnframedCount = 0;

    // Apply highlights and update data if not on the read-only orders page
    for (const [row, data] of productRows.entries()) {
        const isMultiOrder = multiOrderProducts.has(row);
        const isSizeAnomaly = sizeAnomalyProducts.has(row);

        let highlightType = null;
        if (isMultiOrder && isSizeAnomaly) highlightType = 'both';
        else if (isMultiOrder) highlightType = 'multi-order';
        else if (isSizeAnomaly) highlightType = 'size-anomaly';

        if (highlightType) {
            highlightRow(row, highlightType);

            // Only update data on the shipments page, and skip unframed items
            if (!isOrdersPage && (isMultiOrder || isSizeAnomaly)) {
                if (data.isUnframed && isSizeAnomaly) {
                    skippedUnframedCount++;
                } else {
                    const result = await updateProductFields(row);
                    if (result.weightUpdated) weightUpdatedCount++;
                    dimensionsUpdatedCount += result.dimensionsUpdated;
                }
            }
        }
    }

    const totalHighlighted = document.querySelectorAll('[data-extension-highlighted]').length;
    if (totalHighlighted === 0) {
        return { error: "No anomalies found to highlight." };
    }

    return { 
        totalHighlighted, 
        multiOrderCount: multiOrderProducts.size, 
        sizeAnomalyCount: sizeAnomalyProducts.size,
        weightUpdatedCount,
        dimensionsUpdatedCount,
        skippedUnframedCount
    };
}


/**
 * Listen for messages from the popup script.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    (async () => {
        if (request.action === "fillWeights") {
            const result = await handleFillWeights();
            sendResponse(result);
        } else if (request.action === "highlightAnomalies") {
            const result = await handleHighlightAnomalies(false); // isOrdersPage = false
            sendResponse(result);
        } else if (request.action === "highlightAnomaliesOrders") {
            const result = await handleHighlightAnomalies(true); // isOrdersPage = true
            sendResponse(result);
        }
    })();
    return true; // Indicates that the response is sent asynchronously.
});
