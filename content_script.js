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

    // Collect ALL weight elements first, then deduplicate
    const weightSelectors = [
        'kat-input[unique-id*="katal-id-"]',
        'kat-input[data-testid*="weight"]',
    ];
    
    const allWeightElements = new Set();
    for (const selector of weightSelectors) {
        const elements = findAllElements(selector);
        elements.forEach(el => allWeightElements.add(el));
    }

    // Process each unique weight element only once
    for (const el of allWeightElements) {
        // Check if the kat-input element is visible before processing
        if (el.offsetParent === null) continue;
        
        const testId = (el.getAttribute('data-testid') || '').toLowerCase();
        // Ensure it's not a dimension field
        if (!testId.includes('length') && !testId.includes('width') && !testId.includes('height')) {
            const input = getInputFromKatInput(el);
            if (input && !input.disabled && setInputValue(input, weightValue, el)) {
                weightCount++;
                await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
            }
        }
    }

    // Collect ALL dimension elements first, then deduplicate
    const dimensionSelectors = {
        length: 'kat-input[data-testid="length-input"]',
        width: 'kat-input[data-testid="width-input"]',
        height: 'kat-input[data-testid="height-input"]',
    };
    
    const allDimensionElements = new Map(); // Map<element, dimensionType>
    for (const [key, selector] of Object.entries(dimensionSelectors)) {
        const elements = findAllElements(selector);
        elements.forEach(el => {
            // Only add if not already processed
            if (!allDimensionElements.has(el)) {
                allDimensionElements.set(el, key);
            }
        });
    }

    // Process each unique dimension element only once
    for (const [el, dimensionType] of allDimensionElements.entries()) {
        // Check if the kat-input element is visible before processing
        if (el.offsetParent === null) continue;
        
        const input = getInputFromKatInput(el);
        if (input && !input.disabled && setInputValue(input, dimensions[dimensionType], el)) {
            dimensionCount++;
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
    
    if (weightCount === 0 && dimensionCount === 0) {
        return { error: "Could not find any weight or dimension fields." };
    }

    return { weightCount, dimensionCount };
}

/**
 * Finds and updates the weight and dimension fields within a specific product row.
 * Uses the comprehensive v1 logic with multiple selectors and fallbacks.
 * @param {Element} productRow - The container element for a single product.
 * @returns {object} An object with counts of updated fields.
 */
async function updateProductFields(productRow) {
    if (!productRow) return { weightUpdated: false, dimensionsUpdated: 0 };
    
    const weightValue = '890';
    const dimensions = { length: '50', width: '30', height: '2.9' };
    let weightUpdated = false;
    let dimensionsUpdated = 0;
    
    try {
        // Find weight field in this product row - search more thoroughly including shadow DOMs
        const weightSelectors = [
            'input[id*="katal-id-"]',
            'kat-input[unique-id*="katal-id-"]'
        ];
        
        for (const selector of weightSelectors) {
            const weightInputs = findAllElementsInContainer(productRow, selector);
            for (const element of weightInputs) {
                // Exclude dimension inputs
                const testId = (element.getAttribute && element.getAttribute('data-testid')) || '';
                const id = (element.id || '').toLowerCase();
                const uniqueId = (element.getAttribute && element.getAttribute('unique-id')) || '';
                
                if (testId.includes('length') || testId.includes('width') || testId.includes('height') ||
                    id.includes('length') || id.includes('width') || id.includes('height') ||
                    uniqueId.includes('length') || uniqueId.includes('width') || uniqueId.includes('height')) {
                    continue;
                }
                
                let actualInput = element;
                let katInputElement = null;
                
                if (element.tagName === 'KAT-INPUT') {
                    katInputElement = element;
                    actualInput = getInputFromKatInput(element);
                    if (!actualInput) continue;
                }
                
                const isVisible = element.offsetParent !== null;
                if (isVisible && actualInput && !actualInput.disabled) {
                    if (setInputValue(actualInput, weightValue, katInputElement)) {
                        weightUpdated = true;
                        await new Promise(resolve => setTimeout(resolve, 50));
                        break;
                    }
                }
            }
            if (weightUpdated) break;
        }
        
        // Find dimension fields in this product row - search more thoroughly
        const lengthFields = findAllElementsInContainer(productRow, 'kat-input[data-testid="length-input"]');
        const widthFields = findAllElementsInContainer(productRow, 'kat-input[data-testid="width-input"]');
        const heightFields = findAllElementsInContainer(productRow, 'kat-input[data-testid="height-input"]');
        
        // Also try alternative selectors for dimensions
        const altDimensionSelectors = [
            'kat-input.dimensions-input',
            'input[id*="length" i]',
            'input[id*="width" i]',
            'input[id*="height" i]'
        ];
        
        for (const selector of altDimensionSelectors) {
            const found = findAllElementsInContainer(productRow, selector);
            for (const element of found) {
                const testId = (element.getAttribute && element.getAttribute('data-testid')) || '';
                const className = (element.className || '').toLowerCase();
                const id = (element.id || '').toLowerCase();
                
                if (testId.includes('length') || className.includes('length') || id.includes('length')) {
                    if (!lengthFields.includes(element)) lengthFields.push(element);
                } else if (testId.includes('width') || className.includes('width') || id.includes('width')) {
                    if (!widthFields.includes(element)) widthFields.push(element);
                } else if (testId.includes('height') || className.includes('height') || id.includes('height')) {
                    if (!heightFields.includes(element)) heightFields.push(element);
                }
            }
        }
        
        // Update length - use first found field
        if (lengthFields.length > 0) {
            const lengthField = lengthFields[0];
            const actualInput = getInputFromKatInput(lengthField);
            if (actualInput && lengthField.offsetParent !== null && !actualInput.disabled) {
                if (setInputValue(actualInput, dimensions.length, lengthField)) {
                    dimensionsUpdated++;
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }
        }
        
        // Update width - use first found field
        if (widthFields.length > 0) {
            const widthField = widthFields[0];
            const actualInput = getInputFromKatInput(widthField);
            if (actualInput && widthField.offsetParent !== null && !actualInput.disabled) {
                if (setInputValue(actualInput, dimensions.width, widthField)) {
                    dimensionsUpdated++;
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }
        }
        
        // Update height - use first found field
        if (heightFields.length > 0) {
            const heightField = heightFields[0];
            const actualInput = getInputFromKatInput(heightField);
            if (actualInput && heightField.offsetParent !== null && !actualInput.disabled) {
                if (setInputValue(actualInput, dimensions.height, heightField)) {
                    dimensionsUpdated++;
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }
        }
    } catch (e) {
        console.warn('Error updating product fields:', e);
    }
    
    return { weightUpdated, dimensionsUpdated };
}

/**
 * Helper to find fields near a title element (fallback when row search fails).
 * @param {Element} titleElement - The title element to search near.
 * @param {string} weightValue - The weight value to set.
 * @param {object} dimensions - The dimension values to set.
 * @returns {object} An object with counts of updated fields.
 */
async function updateFieldsNearTitle(titleElement, weightValue, dimensions) {
    if (!titleElement) return { weightUpdated: false, dimensionsUpdated: 0 };
    
    let weightUpdated = false;
    let dimensionsUpdated = 0;
    
    try {
        // Find the container that holds both title and fields
        let container = titleElement;
        for (let i = 0; i < 10; i++) {
            container = container.parentElement;
            if (!container) break;
            
            // Search for fields in this container
            const weightSelectors = ['input[id*="katal-id-"]', 'kat-input[unique-id*="katal-id-"]'];
            for (const selector of weightSelectors) {
                const weightInputs = findAllElementsInContainer(container, selector);
                for (const element of weightInputs) {
                    const testId = (element.getAttribute && element.getAttribute('data-testid')) || '';
                    const id = (element.id || '').toLowerCase();
                    const uniqueId = (element.getAttribute && element.getAttribute('unique-id')) || '';
                    
                    if (testId.includes('length') || testId.includes('width') || testId.includes('height') ||
                        id.includes('length') || id.includes('width') || id.includes('height') ||
                        uniqueId.includes('length') || uniqueId.includes('width') || uniqueId.includes('height')) {
                        continue;
                    }
                    
                    let actualInput = element;
                    let katInputElement = null;
                    
                    if (element.tagName === 'KAT-INPUT') {
                        katInputElement = element;
                        actualInput = getInputFromKatInput(element);
                        if (!actualInput) continue;
                    }
                    
                    if (element.offsetParent !== null && actualInput && !actualInput.disabled) {
                        if (setInputValue(actualInput, weightValue, katInputElement)) {
                            weightUpdated = true;
                            await new Promise(resolve => setTimeout(resolve, 50));
                            break;
                        }
                    }
                }
                if (weightUpdated) break;
            }
            
            // Find dimension fields
            const lengthFields = findAllElementsInContainer(container, 'kat-input[data-testid="length-input"]');
            const widthFields = findAllElementsInContainer(container, 'kat-input[data-testid="width-input"]');
            const heightFields = findAllElementsInContainer(container, 'kat-input[data-testid="height-input"]');
            
            if (lengthFields.length > 0) {
                const lengthField = lengthFields[0];
                const actualInput = getInputFromKatInput(lengthField);
                if (actualInput && lengthField.offsetParent !== null && !actualInput.disabled) {
                    if (setInputValue(actualInput, dimensions.length, lengthField)) {
                        dimensionsUpdated++;
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                }
            }
            
            if (widthFields.length > 0) {
                const widthField = widthFields[0];
                const actualInput = getInputFromKatInput(widthField);
                if (actualInput && widthField.offsetParent !== null && !actualInput.disabled) {
                    if (setInputValue(actualInput, dimensions.width, widthField)) {
                        dimensionsUpdated++;
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                }
            }
            
            if (heightFields.length > 0) {
                const heightField = heightFields[0];
                const actualInput = getInputFromKatInput(heightField);
                if (actualInput && heightField.offsetParent !== null && !actualInput.disabled) {
                    if (setInputValue(actualInput, dimensions.height, heightField)) {
                        dimensionsUpdated++;
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                }
            }
            
            // If we found fields, we're done
            if (weightUpdated && dimensionsUpdated >= 2) break;
        }
    } catch (e) {
        console.warn('Error updating fields near title:', e);
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
    const productRows = new Map(); // Map<Element, {titleElement: Element, title: string, orderId: string, isUnframed: boolean}>

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
                titleElement: titleElement,
                title: titleText,
                orderId: orderId,
                isUnframed: titleText.includes('unframed') || titleText.includes('tape')
            });
        }
    }

    const multiOrderProducts = new Set(); // Orders with MORE THAN 4 products
    const sizeAnomalyProducts = new Set();
    
    // Identify multi-order products (orders with MORE THAN 4 products)
    // Only these will have their weights/dimensions updated (if they don't have size anomalies)
    for (const orderId in orderProducts) {
        if (orderProducts[orderId].length > 4) {
            orderProducts[orderId].forEach(row => multiOrderProducts.add(row));
        }
    }

    // Identify size anomaly products by checking product titles
    // Look for 12x18, 18x12, 12*18, or 18*12 patterns
    const productTitleElements = findAllElements('span[data-testid="line-item-title"]');
    for (const titleElement of productTitleElements) {
        const titleText = (titleElement.textContent || '').toLowerCase();
        const titleHTML = (titleElement.innerHTML || '').toLowerCase();
        const combined = titleText + ' ' + titleHTML;
        
        // Check for 12x18, 18x12, 12*18, or 18*12 patterns in the product name
        const patterns = [
            /12\s*x\s*18/i,
            /18\s*x\s*12/i,
            /12\s*\*\s*18/i,  // Support asterisk
            /18\s*\*\s*12/i,  // Support asterisk
            /12x18/i,
            /18x12/i,
            /12\*18/i,        // Support asterisk
            /18\*12/i,        // Support asterisk
            /12\s*["']\s*x\s*18\s*["']/i,
            /18\s*["']\s*x\s*12\s*["']/i
        ];
        
        let hasSizeAnomaly = false;
        for (const pattern of patterns) {
            if (pattern.test(combined)) {
                hasSizeAnomaly = true;
                break;
            }
        }
        
        if (hasSizeAnomaly) {
            const productRow = findProductRow(titleElement);
            if (productRow) {
                sizeAnomalyProducts.add(productRow);
            }
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

            // Only update data on the shipments page
            // Update rules:
            // 1. Size anomalies (12x18/18x12) - always update (unless unframed/tape)
            // 2. Multi-order (>4 products) - only update if NOT a size anomaly
            if (!isOrdersPage) {
                if (isSizeAnomaly) {
                    // Size anomalies: update unless unframed/tape
                    if (data.isUnframed) {
                        skippedUnframedCount++;
                    } else {
                        // Try updating via product row first
                        let result = await updateProductFields(row);
                        // If that didn't work, try finding fields near the title
                        if ((!result.weightUpdated || result.dimensionsUpdated < 2) && data.titleElement) {
                            const titleResult = await updateFieldsNearTitle(data.titleElement, '890', { length: '50', width: '30', height: '2.9' });
                            if (titleResult.weightUpdated) result.weightUpdated = true;
                            result.dimensionsUpdated = Math.max(result.dimensionsUpdated, titleResult.dimensionsUpdated);
                        }
                        if (result.weightUpdated) weightUpdatedCount++;
                        dimensionsUpdatedCount += result.dimensionsUpdated;
                    }
                } else if (isMultiOrder) {
                    // Multi-order (>4 products) without size anomaly: update weights/dimensions
                    let result = await updateProductFields(row);
                    // If that didn't work, try finding fields near the title
                    if ((!result.weightUpdated || result.dimensionsUpdated < 2) && data.titleElement) {
                        const titleResult = await updateFieldsNearTitle(data.titleElement, '890', { length: '50', width: '30', height: '2.9' });
                        if (titleResult.weightUpdated) result.weightUpdated = true;
                        result.dimensionsUpdated = Math.max(result.dimensionsUpdated, titleResult.dimensionsUpdated);
                    }
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

    // Count unique orders, not products
    // Multi-order: orders with MORE THAN 4 products
    const multiOrderOrderIds = new Set();
    for (const orderId in orderProducts) {
        if (orderProducts[orderId].length > 4) {
            multiOrderOrderIds.add(orderId);
        }
    }
    
    // Size anomaly: orders containing products with 12x18/18x12/12*18/18*12 patterns
    const sizeAnomalyOrderIds = new Set();
    for (const [row, data] of productRows.entries()) {
        if (sizeAnomalyProducts.has(row)) {
            sizeAnomalyOrderIds.add(data.orderId);
        }
    }

    return { 
        totalHighlighted, 
        multiOrderCount: multiOrderOrderIds.size, // Count unique orders, not products
        sizeAnomalyCount: sizeAnomalyOrderIds.size, // Count unique orders, not products
        weightUpdatedCount,
        dimensionsUpdatedCount,
        skippedUnframedCount
    };
}
