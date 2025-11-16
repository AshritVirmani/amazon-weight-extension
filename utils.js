/**
 * Finds all elements matching a selector, searching within Shadow DOMs.
 * @param {string} selector - The CSS selector to match.
 * @param {Element} [scope=document.body] - The element to search within.
 * @returns {Array<Element>} An array of unique elements found.
 */
function findAllElements(selector, scope = document.body) {
    let elements = [];
    if (!scope) return elements;

    // Search within the current scope
    scope.querySelectorAll(selector).forEach(el => elements.push(el));

    // Use a TreeWalker to safely navigate through all elements, including Shadow DOMs.
    const walker = document.createTreeWalker(
        scope,
        NodeFilter.SHOW_ELEMENT,
        null,
        false
    );

    let node;
    while (node = walker.nextNode()) {
        if (node.shadowRoot) {
            node.shadowRoot.querySelectorAll(selector).forEach(el => elements.push(el));
        }
    }

    // Return a unique set of elements
    return [...new Set(elements)];
}

/**
 * Gets the actual <input> element from a <kat-input> custom element.
 * @param {Element} katInput - The <kat-input> custom element.
 * @returns {HTMLInputElement|null} The found input element or null.
 */
function getInputFromKatInput(katInput) {
    if (!katInput || !katInput.shadowRoot) {
        return null;
    }
    // The actual input is usually the first one found in the shadow DOM.
    return katInput.shadowRoot.querySelector('input');
}

/**
 * Sets a value on an input field and dispatches events to ensure frameworks detect it.
 * @param {HTMLInputElement} input - The input element to set the value on.
 * @param {string} value - The value to set.
 * @param {Element} [katInputElement=null] - The parent <kat-input> element, if any.
 * @returns {boolean} True if the value was set successfully.
 */
function setInputValue(input, value, katInputElement = null) {
    if (!input || input.disabled || input.offsetParent === null) return false;

    input.value = value;

    // Dispatch events to simulate user input
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));

    // Also update the parent <kat-input> if it exists
    const parentKatInput = katInputElement || input.closest('kat-input');
    if (parentKatInput) {
        try {
            parentKatInput.value = value;
            parentKatInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            parentKatInput.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        } catch (e) {
            console.warn('Failed to set value on kat-input parent:', e);
        }
    }
    return true;
}

/**
 * Traverses up the DOM from an element to find its logical product container/row.
 * @param {Element} element - The starting element.
 * @returns {Element} The found container element.
 */
function findProductRow(element) {
    let container = element;
    for (let i = 0; i < 15; i++) { // Limit search depth to prevent infinite loops
        container = container.parentElement;
        if (!container) break;

        const className = (container.className || '').toLowerCase();
        const tagName = container.tagName;

        // More robust selectors for product rows
        if (
            tagName === 'TR' ||
            className.includes('row') ||
            className.includes('item') ||
            className.includes('product') ||
            className.includes('line-item') ||
            className.includes('order-item')
        ) {
            return container;
        }
    }
    // Fallback to the closest table row or a generic div
    return element.closest('tr, div.a-row, div.item, div.line-item');
}

/**
 * Highlights a given element with a specific style based on the anomaly type.
 * @param {Element} container - The element to highlight.
 * @param {string} colorType - The type of anomaly ('multi-order', 'size-anomaly', 'both').
 */
function highlightRow(container, colorType) {
    if (!container) return;
    
    // Clear previous highlights
    container.style.backgroundColor = '';
    container.style.border = '';
    container.style.boxShadow = '';
    container.removeAttribute('data-extension-highlighted');

    const styles = {
        'multi-order': { bg: '#fff3cd', border: '3px solid #ff9900' },
        'size-anomaly': { bg: '#ffe6e6', border: '3px solid #ff6b6b' },
        'both': { bg: '#e6e6ff', border: '3px solid #9b59b6' },
    };

    if (styles[colorType]) {
        container.style.backgroundColor = styles[colorType].bg;
        container.style.border = styles[colorType].border;
        container.style.boxShadow = `0 0 8px ${styles[colorType].border}`;
        container.setAttribute('data-extension-highlighted', colorType);
    }
}

/**
 * Removes all highlights set by the extension from the page.
 */
function clearAllHighlights() {
    findAllElements('[data-extension-highlighted]').forEach(el => {
        el.style.backgroundColor = '';
        el.style.border = '';
        el.style.boxShadow = '';
        el.removeAttribute('data-extension-highlighted');
    });
}

/**
 * Finds the order ID for a given element by traversing up the DOM.
 * @param {Element} element - The starting element.
 * @returns {string|null} The found order ID or null.
 */
function findOrderId(element) {
    let container = element;
    for (let i = 0; i < 20; i++) { // Limit search depth
        if (!container) break;
        const text = (container.textContent || '').trim();
        
        // Look for standard Amazon order ID format (e.g., 123-1234567-1234567)
        const orderIdMatch = text.match(/\d{3}-\d{7}-\d{7}/);
        if (orderIdMatch) {
            return orderIdMatch[0];
        }
        
        const dataOrderId = container.getAttribute('data-order-id');
        if (dataOrderId) {
            return dataOrderId;
        }

        container = container.parentElement;
    }
    return null;
}

/**
 * Checks if an element's text content contains a size anomaly (12x18 or 18x12).
 * @param {Element} element - The element to check.
 * @returns {boolean} True if the anomaly is found.
 */
function hasSizeAnomaly(element) {
    if (!element) return false;
    const text = (element.textContent || '').toLowerCase();
    
    // Use regex to find "12x18" or "18x12" with optional spaces around the "x"
    // This is a simplified but effective version of the original logic.
    const patterns = [
        /12\s*x\s*18/i,
        /18\s*x\s*12/i,
    ];
    
    for (const pattern of patterns) {
        if (pattern.test(text)) {
            return true;
        }
    }
    return false;
}
