/**

* Adds a click listener to the button in the popup.

* When clicked, it executes the setWeightsAndDimensions function on the active Amazon tab.

*/

document.getElementById('fillWeightsBtn').addEventListener('click', async () => {

  const statusDiv = document.getElementById('status');
  
  statusDiv.textContent = 'Working...';
  
  
  
  // Get the currently active tab in the browser
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  
  
  // Inject the setWeightsAndDimensions function into the active tab
  
  try {
  
  const results = await chrome.scripting.executeScript({
  
  target: { tabId: tab.id },
  
  function: setWeightsAndDimensions,
  
  });
  
  
  
  // The result is an array, get the result from the main frame
  
  // Safely check for results array and first element
  
  let mainFrameResult = null;
  
  if (results && Array.isArray(results) && results.length > 0 && results[0]) {
  
  mainFrameResult = results[0].result || null;
  
  }
  
  
  // ==========================================================
  
  // ▼▼▼ THIS IS THE FIX FOR THE ERROR IN YOUR SCREENSHOT ▼▼▼
  
  // ==========================================================
  
  
  if (!mainFrameResult || mainFrameResult === null) {
  
  // Correctly handle a null result without trying to read .error
  
  statusDiv.textContent = 'Error: No result returned from script.';
  
  } else if (typeof mainFrameResult === 'object' && mainFrameResult !== null && 'error' in mainFrameResult && mainFrameResult.error) {
  
  // This now safely handles an error *object* returned from the script
  
  statusDiv.textContent = mainFrameResult.error;
  
  } else if (typeof mainFrameResult === 'object' && mainFrameResult !== null) {
  
  // This handles a successful result
  
  const weightCount = mainFrameResult.weightCount || 0;
  
  const dimensionCount = mainFrameResult.dimensionCount || 0;
  
  const weightMsg = weightCount > 0 ? `${weightCount} weight(s)` : '';
  
  const dimMsg = dimensionCount > 0 ? `${dimensionCount} dimension field(s)` : '';
  
  const parts = [weightMsg, dimMsg].filter(Boolean);
  
  statusDiv.textContent = parts.length > 0 ? `Updated: ${parts.join(', ')}.` : 'No fields found to update.';
  
  } else {
  
  statusDiv.textContent = 'Error: Unexpected result format.';
  
  }
  
  // ==========================================================
  
  // ▲▲▲ END OF FIX ▲▲▲
  
  // ==========================================================
  
  
  
  } catch (e) {
  
  statusDiv.textContent = 'Error: Cannot access this page. Try reloading the Amazon tab.';
  
  console.error(e);
  
  }
  
  });
  
  
  
  
  
  /**
  
  * This function is injected into the Amazon page to find and update weight and dimension fields.
  
  * It updates fields sequentially with a delay to prevent page crashes.
  
  *
  
  * NOTE: All helper functions have been moved INSIDE this function so they
  
  * are injected and defined in the correct scope on the target page.
  
  */
  
  /**
   * Adds a click listener to the highlight anomalies button.
   */
  document.getElementById('highlightAnomaliesBtn').addEventListener('click', async () => {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = 'Working...';
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: highlightAnomalies,
      });
      
      let mainFrameResult = null;
      if (results && Array.isArray(results) && results.length > 0 && results[0]) {
        mainFrameResult = results[0].result || null;
      }
      
      if (!mainFrameResult || mainFrameResult === null) {
        statusDiv.textContent = 'Error: No result returned from script.';
      } else if (typeof mainFrameResult === 'object' && mainFrameResult !== null && 'error' in mainFrameResult && mainFrameResult.error) {
        statusDiv.textContent = mainFrameResult.error;
      } else if (typeof mainFrameResult === 'object' && mainFrameResult !== null) {
        const multiOrderCount = mainFrameResult.multiOrderCount || 0;
        const sizeAnomalyCount = mainFrameResult.sizeAnomalyCount || 0;
        const totalHighlighted = mainFrameResult.totalHighlighted || 0;
        const weightUpdatedCount = mainFrameResult.weightUpdatedCount || 0;
        const dimensionsUpdatedCount = mainFrameResult.dimensionsUpdatedCount || 0;
        const skippedUnframedCount = mainFrameResult.skippedUnframedCount || 0;
        
        const parts = [];
        if (multiOrderCount > 0) {
          parts.push(`${multiOrderCount} multi-order product(s)`);
        }
        if (sizeAnomalyCount > 0) {
          parts.push(`${sizeAnomalyCount} 12x18/18x12 product(s)`);
        }
        
        const updateParts = [];
        if (weightUpdatedCount > 0) {
          updateParts.push(`${weightUpdatedCount} weight(s) updated to 890`);
        }
        if (dimensionsUpdatedCount > 0) {
          updateParts.push(`${dimensionsUpdatedCount} dimension field(s) updated to 50x30x2.9`);
        }
        if (skippedUnframedCount > 0) {
          updateParts.push(`${skippedUnframedCount} unframed/tape product(s) skipped`);
        }
        
        let message = '';
        if (parts.length > 0) {
          message = `Highlighted: ${parts.join(', ')}.`;
        } else {
          message = `Highlighted ${totalHighlighted} product(s).`;
        }
        
        if (updateParts.length > 0) {
          message += ` ${updateParts.join(', ')}.`;
        }
        
        statusDiv.textContent = message;
      } else {
        statusDiv.textContent = 'Error: Unexpected result format.';
      }
    } catch (e) {
      statusDiv.textContent = 'Error: Cannot access this page. Try reloading the Amazon tab.';
      console.error(e);
    }
  });
  
  /**
   * Adds a click listener to the highlight anomalies orders page button.
   */
  document.getElementById('highlightAnomaliesOrdersBtn').addEventListener('click', async () => {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = 'Working...';
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: highlightAnomaliesOrdersPage,
      });
      
      let mainFrameResult = null;
      if (results && Array.isArray(results) && results.length > 0 && results[0]) {
        mainFrameResult = results[0].result || null;
      }
      
      if (!mainFrameResult || mainFrameResult === null) {
        statusDiv.textContent = 'Error: No result returned from script.';
      } else if (typeof mainFrameResult === 'object' && mainFrameResult !== null && 'error' in mainFrameResult && mainFrameResult.error) {
        statusDiv.textContent = mainFrameResult.error;
      } else if (typeof mainFrameResult === 'object' && mainFrameResult !== null) {
        const multiOrderCount = mainFrameResult.multiOrderCount || 0;
        const sizeAnomalyCount = mainFrameResult.sizeAnomalyCount || 0;
        const totalHighlighted = mainFrameResult.totalHighlighted || 0;
        
        const parts = [];
        if (multiOrderCount > 0) {
          parts.push(`${multiOrderCount} multi-order product(s)`);
        }
        if (sizeAnomalyCount > 0) {
          parts.push(`${sizeAnomalyCount} 12x18/18x12 product(s)`);
        }
        
        let message = '';
        if (parts.length > 0) {
          message = `Highlighted: ${parts.join(', ')}.`;
        } else {
          message = `Highlighted ${totalHighlighted} product(s).`;
        }
        
        statusDiv.textContent = message;
      } else {
        statusDiv.textContent = 'Error: Unexpected result format.';
      }
    } catch (e) {
      statusDiv.textContent = 'Error: Cannot access this page. Try reloading the Amazon tab.';
      console.error(e);
    }
  });
  
  async function setWeightsAndDimensions() {
  
  
  
  // ==========================================================
  
  // ▼▼▼ HELPER FUNCTIONS MOVED INSIDE ▼▼▼
  
  // ==========================================================
  
  
  
  /**
  
  * Helper function to find all elements matching a selector, including in Shadow DOMs.
  
  */
  
  function findAllElements(selector) {
  
  let elements = [];
  
  
  
  // Use a TreeWalker to safely navigate through all elements, including Shadow DOMs.
  
  const walker = document.createTreeWalker(
  
  document.body,
  
  NodeFilter.SHOW_ELEMENT,
  
  null,
  
  false
  
  );
  
  
  
  let node;
  
  while (node = walker.nextNode()) {
  
  // If the element has a shadow root, search for our elements inside it.
  
  if (node.shadowRoot) {
  
  node.shadowRoot.querySelectorAll(selector).forEach(el => elements.push(el));
  
  }
  
  }
  
  
  
  // Also run a query on the main document just in case some are not in a shadow DOM.
  
  document.querySelectorAll(selector).forEach(el => elements.push(el));
  
  
  
  // Remove any duplicates that might have been found
  
  return [...new Set(elements)];
  
  }
  
  
  
  /**
  
  * Helper function to get the actual input element from a kat-input custom element.
  
  * The actual input is inside the shadow DOM.
  
  */
  
  function getInputFromKatInput(katInput) {
  
  if (!katInput || !katInput.shadowRoot) {
  
  return null;
  
  }
  
  
  // Try to find the actual input element inside the shadow DOM
  
  const input = katInput.shadowRoot.querySelector('input');
  
  if (input) {
  
  return input;
  
  }
  
  
  // Sometimes the input might be nested deeper
  
  const allInputs = katInput.shadowRoot.querySelectorAll('input');
  
  return allInputs.length > 0 ? allInputs[0] : null;
  
  }
  
  
  
  /**
  
  * Helper function to set a value on an input field and trigger events.
  
  * Can handle both regular inputs and kat-input custom elements.
  
  */
  
  function setInputValue(input, value, katInputElement = null) {
  
  if (!input) return false;
  
  
  // Set value on the actual input element
  
  input.value = value;
  
  
  // Programmatically trigger events to ensure the website's framework detects the change.
  
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  
  input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  
  input.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));
  
  
  // If we have a kat-input element, also set the value on it
  
  if (katInputElement) {
  
  try {
  
  katInputElement.value = value;
  
  katInputElement.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  
  katInputElement.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  
  } catch (e) {
  
  console.warn('Failed to set value on kat-input:', e);
  
  }
  
  } else if (input.closest) {
  
  // Try to find the kat-input parent
  
  const katInput = input.closest('kat-input');
  
  if (katInput) {
  
  try {
  
  katInput.value = value;
  
  katInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  
  katInput.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  
  } catch (e) {
  
  console.warn('Failed to set value on kat-input parent:', e);
  
  }
  
  }
  
  }
  
  
  return true;
  
  }
  
  
  
  // ==========================================================
  
  // ▲▲▲ END OF HELPER FUNCTIONS ▲▲▲
  
  // ==========================================================
  
  
  
  //
  
  // --- Main execution logic for setWeightsAndDimensions ---
  
  //
  
  
  let weightCount = 0;
  
  let dimensionCount = 0;
  
  
  
  // Dimension values: 32x24x2.5 (length x width x height in cm)
  
  const dimensions = {
  
  length: '32',
  
  width: '24',
  
  height: '2.5'
  
  };
  
  
  
  // Find weight fields - try multiple selectors to catch all weight inputs
  
  const weightSelectors = [
  
  'input[id*="katal-id-"]',
  
  'kat-input[unique-id*="katal-id-"]',
  
  'input[type="number"]', // Also check all number inputs that might be weights
  
  'kat-input[type="number"]'
  
  ];
  
  
  
  let weightInputs = [];
  
  for (const selector of weightSelectors) {
  
  try {
  
  const found = findAllElements(selector);
  
  weightInputs.push(...found);
  
  } catch (e) {
  
  console.warn('Weight selector failed:', selector, e);
  
  }
  
  }
  
  
  // Filter weight inputs - exclude dimension inputs
  
  weightInputs = weightInputs.filter(element => {
  
  const testId = (element.getAttribute && element.getAttribute('data-testid')) || '';
  
  const id = (element.id || '').toLowerCase();
  
  const uniqueId = (element.getAttribute && element.getAttribute('unique-id')) || '';
  
  
  // Exclude dimension fields
  
  if (testId.includes('length') || testId.includes('width') || testId.includes('height') ||
  
  id.includes('length') || id.includes('width') || id.includes('height') ||
  
  uniqueId.includes('length') || uniqueId.includes('width') || uniqueId.includes('height')) {
  
  return false;
  
  }
  
  
  // For katal-id inputs, include them (these are likely weights)
  
  if (id.includes('katal-id') || uniqueId.includes('katal-id')) {
  
  return true;
  
  }
  
  
  // For other inputs, check if they're in a weight-related context
  
  // This is a fallback - if it's not clearly a dimension, and has katal-id, include it
  
  return true;
  
  });
  
  
  weightInputs = [...new Set(weightInputs)];
  
  
  
  // Process weight fields - process ALL fields, don't stop on errors
  
  for (const element of weightInputs) {
  
  try {
  
  let actualInput = element;
  
  let katInputElement = null;
  
  
  if (element.tagName === 'KAT-INPUT') {
  
  katInputElement = element;
  
  actualInput = getInputFromKatInput(element);
  
  if (!actualInput) continue;
  
  }
  
  
  
  // Check if visible and enabled
  
  const isVisible = element.offsetParent !== null;
  
  if (isVisible && actualInput && !actualInput.disabled) {
  
  if (setInputValue(actualInput, '410', katInputElement)) {
  
  weightCount++;
  
  // Small delay to prevent overwhelming the page
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  }
  
  }
  
  } catch (e) {
  
  // Log error but continue processing other fields
  
  console.warn('Error processing weight field:', e);
  
  continue;
  
  }
  
  }
  
  
  
  // Find dimension fields using data-testid attributes on kat-input elements
  
  const dimensionFields = {
  
  length: findAllElements('kat-input[data-testid="length-input"]'),
  
  width: findAllElements('kat-input[data-testid="width-input"]'),
  
  height: findAllElements('kat-input[data-testid="height-input"]')
  
  };
  
  
  
  // Also try alternative selectors for dimensions
  
  const altDimensionSelectors = [
  
  'kat-input.dimensions-input',
  
  'input[id*="length" i]',
  
  'input[id*="width" i]',
  
  'input[id*="height" i]'
  
  ];
  
  
  
  for (const selector of altDimensionSelectors) {
  
  try {
  
  const found = findAllElements(selector);
  
  for (const element of found) {
  
  const testId = element.getAttribute('data-testid') || '';
  
  const className = (element.className || '').toLowerCase();
  
  const id = (element.id || '').toLowerCase();
  
  
  if (testId.includes('length') || className.includes('length') || id.includes('length')) {
  
  dimensionFields.length.push(element);
  
  } else if (testId.includes('width') || className.includes('width') || id.includes('width')) {
  
  dimensionFields.width.push(element);
  
  } else if (testId.includes('height') || className.includes('height') || id.includes('height')) {
  
  dimensionFields.height.push(element);
  
  }
  
  }
  
  } catch (e) {
  
  console.warn('Dimension selector failed:', selector, e);
  
  }
  
  }
  
  
  
  // Remove duplicates
  
  dimensionFields.length = [...new Set(dimensionFields.length)];
  
  dimensionFields.width = [...new Set(dimensionFields.width)];
  
  dimensionFields.height = [...new Set(dimensionFields.height)];
  
  
  
  // Process length fields
  
  for (const element of dimensionFields.length) {
  
  let actualInput = element;
  
  let katInputElement = null;
  
  
  if (element.tagName === 'KAT-INPUT') {
  
  katInputElement = element;
  
  actualInput = getInputFromKatInput(element);
  
  if (!actualInput) continue;
  
  }
  
  
  
  const isVisible = element.offsetParent !== null;
  
  if (isVisible && !actualInput.disabled) {
  
  if (setInputValue(actualInput, dimensions.length, katInputElement)) {
  
  dimensionCount++;
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  }
  
  }
  
  }
  
  
  
  // Process width fields
  
  for (const element of dimensionFields.width) {
  
  let actualInput = element;
  
  let katInputElement = null;
  
  
  if (element.tagName === 'KAT-INPUT') {
  
  katInputElement = element;
  
  actualInput = getInputFromKatInput(element);
  
  if (!actualInput) continue;
  
  }
  
  
  
  const isVisible = element.offsetParent !== null;
  
  if (isVisible && !actualInput.disabled) {
  
  if (setInputValue(actualInput, dimensions.width, katInputElement)) {
  
  dimensionCount++;
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  }
  
  }
  
  }
  
  
  
  // Process height fields
  
  for (const element of dimensionFields.height) {
  
  let actualInput = element;
  
  let katInputElement = null;
  
  
  if (element.tagName === 'KAT-INPUT') {
  
  katInputElement = element;
  
  actualInput = getInputFromKatInput(element);
  
  if (!actualInput) continue;
  
  }
  
  
  
  const isVisible = element.offsetParent !== null;
  
  if (isVisible && !actualInput.disabled) {
  
  if (setInputValue(actualInput, dimensions.height, katInputElement)) {
  
  dimensionCount++;
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  }
  
  }
  
  }
  
  
  
  if (weightCount === 0 && dimensionCount === 0) {
  
  return { error: "Could not find any weight or dimension fields. Please check the page structure." };
  
  }
  
  
  
  return {
  
  weightCount: weightCount,
  
  dimensionCount: dimensionCount
  
  };
  
  }
  
  
  
  /**
   * Function to highlight anomalies in products:
   * - Products in multi-order quantity (orders with multiple products)
   * - Products with 12x18 or 18x12 in their name
   * Uses different colors for each type
   * Automatically updates weight to 890 and dimensions to 50x30x2.9 for anomalies
   * Skips products with "unframed" or "tape" in the name
   */
  async function highlightAnomalies() {
    /**
     * Helper function to find all elements matching a selector, including in Shadow DOMs.
     */
    function findAllElements(selector) {
      let elements = [];
      
      const walker = document.createTreeWalker(
        document.body,
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
      
      document.querySelectorAll(selector).forEach(el => elements.push(el));
      return [...new Set(elements)];
    }
    
    /**
     * Helper function to find the order ID for a given element
     */
    function findOrderId(element) {
      let container = element;
      for (let i = 0; i < 20; i++) {
        if (!container) break;
        
        const text = (container.textContent || '').trim();
        const id = (container.id || '').toLowerCase();
        const className = (container.className || '').toLowerCase();
        
        // Common order ID patterns
        const orderIdMatch = text.match(/order\s*[#:]?\s*([A-Z0-9-]{10,})/i);
        if (orderIdMatch) {
          return orderIdMatch[1];
        }
        
        const dataOrderId = container.getAttribute('data-order-id') || 
                           container.getAttribute('data-orderid') ||
                           container.getAttribute('data-order-number');
        if (dataOrderId) {
          return dataOrderId;
        }
        
        if (id.includes('order') || className.includes('order')) {
          const numbers = text.match(/\d{3}-\d{7}-\d{7}/);
          if (numbers) {
            return numbers[0];
          }
        }
        
        container = container.parentElement;
      }
      return null;
    }
    
    /**
     * Helper function to find the row/container that groups a product
     */
    function findProductRow(element) {
      let container = element;
      for (let i = 0; i < 15; i++) {
        if (!container) break;
        container = container.parentElement;
        if (!container) break;
        
        const className = (container.className || '').toLowerCase();
        const id = (container.id || '').toLowerCase();
        const tagName = container.tagName || '';
        
        if (className.includes('row') || className.includes('item') || 
            className.includes('product') || className.includes('cell') ||
            className.includes('line-item') || className.includes('order-item') ||
            id.includes('row') || id.includes('item') ||
            tagName === 'TR' || tagName === 'TBODY') {
          return container;
        }
      }
      return element.closest('tr') || element.closest('div') || element;
    }
    
    /**
     * Helper function to get the actual input element from a kat-input custom element.
     */
    function getInputFromKatInput(katInput) {
      if (!katInput || !katInput.shadowRoot) {
        return null;
      }
      
      const input = katInput.shadowRoot.querySelector('input');
      if (input) {
        return input;
      }
      
      const allInputs = katInput.shadowRoot.querySelectorAll('input');
      return allInputs.length > 0 ? allInputs[0] : null;
    }
    
    /**
     * Helper function to set a value on an input field and trigger events.
     */
    function setInputValue(input, value, katInputElement = null) {
      if (!input) return false;
      
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));
      
      if (katInputElement) {
        try {
          katInputElement.value = value;
          katInputElement.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
          katInputElement.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        } catch (e) {
          console.warn('Failed to set value on kat-input:', e);
        }
      } else if (input.closest) {
        const katInput = input.closest('kat-input');
        if (katInput) {
          try {
            katInput.value = value;
            katInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            katInput.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
          } catch (e) {
            console.warn('Failed to set value on kat-input parent:', e);
          }
        }
      }
      
      return true;
    }
    
    /**
     * Helper function to find all elements within a container, including shadow DOMs
     */
    function findAllElementsInContainer(container, selector) {
      let elements = [];
      
      if (!container) return elements;
      
      const walker = document.createTreeWalker(
        container,
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
      
      if (container.querySelectorAll) {
        container.querySelectorAll(selector).forEach(el => elements.push(el));
      }
      
      return [...new Set(elements)];
    }
    
    /**
     * Helper function to find and update weight and dimension fields within a product row
     */
    async function updateProductFields(productRow, weightValue, dimensions) {
      if (!productRow) return { weightUpdated: false, dimensionsUpdated: 0 };
      
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
     * Helper function to check if a product name contains 12x18 or 18x12
     */
    function hasSizeAnomaly(element) {
      try {
        let container = element;
        for (let i = 0; i < 20; i++) {
          if (!container) break;
          
          const text = (container.textContent || '').toLowerCase();
          const innerHTML = (container.innerHTML || '').toLowerCase();
          const combined = text + ' ' + innerHTML;
          
          // Check for 12x18 or 18x12 patterns
          const patterns = [
            /12\s*x\s*18/i,
            /18\s*x\s*12/i,
            /12x18/i,
            /18x12/i,
            /12\s*["']\s*x\s*18\s*["']/i,
            /18\s*["']\s*x\s*12\s*["']/i
          ];
          
          for (const pattern of patterns) {
            if (pattern.test(combined)) {
              return true;
            }
          }
          
          container = container.parentElement;
        }
      } catch (e) {
        console.warn('Error checking for size anomaly:', e);
      }
      return false;
    }
    
    /**
     * Helper function to highlight a row/container with a specific color
     */
    function highlightRow(container, colorType) {
      if (!container) return;
      try {
        // Remove existing highlights first
        container.style.backgroundColor = '';
        container.style.border = '';
        container.style.borderRadius = '';
        container.style.boxShadow = '';
        container.removeAttribute('data-amazon-extension-highlighted');
        container.removeAttribute('data-amazon-extension-highlight-type');
        
        if (colorType === 'multi-order') {
          // Yellow/orange for multi-order products
          container.style.backgroundColor = '#fff3cd';
          container.style.border = '3px solid #ff9900';
          container.style.borderRadius = '4px';
          container.style.boxShadow = '0 0 8px rgba(255, 153, 0, 0.4)';
          container.setAttribute('data-amazon-extension-highlighted', 'true');
          container.setAttribute('data-amazon-extension-highlight-type', 'multi-order');
        } else if (colorType === 'size-anomaly') {
          // Red/pink for 12x18/18x12 products
          container.style.backgroundColor = '#ffe6e6';
          container.style.border = '3px solid #ff6b6b';
          container.style.borderRadius = '4px';
          container.style.boxShadow = '0 0 8px rgba(255, 107, 107, 0.4)';
          container.setAttribute('data-amazon-extension-highlighted', 'true');
          container.setAttribute('data-amazon-extension-highlight-type', 'size-anomaly');
        } else if (colorType === 'both') {
          // Purple for products that match both conditions
          container.style.backgroundColor = '#e6e6ff';
          container.style.border = '3px solid #9b59b6';
          container.style.borderRadius = '4px';
          container.style.boxShadow = '0 0 8px rgba(155, 89, 182, 0.4)';
          container.setAttribute('data-amazon-extension-highlighted', 'true');
          container.setAttribute('data-amazon-extension-highlight-type', 'both');
        }
      } catch (e) {
        console.warn('Error highlighting row:', e);
      }
    }
    
    // First, remove any existing highlights
    const existingHighlights = document.querySelectorAll('[data-amazon-extension-highlighted="true"]');
    existingHighlights.forEach(el => {
      el.style.backgroundColor = '';
      el.style.border = '';
      el.style.borderRadius = '';
      el.style.boxShadow = '';
      el.removeAttribute('data-amazon-extension-highlighted');
      el.removeAttribute('data-amazon-extension-highlight-type');
    });
    
    // Find all dimension fields to identify products
    const dimensionFields = {
      length: findAllElements('kat-input[data-testid="length-input"]'),
      width: findAllElements('kat-input[data-testid="width-input"]'),
      height: findAllElements('kat-input[data-testid="height-input"]')
    };
    
    // Also try alternative selectors
    const altDimensionSelectors = [
      'kat-input.dimensions-input',
      'input[id*="length" i]',
      'input[id*="width" i]',
      'input[id*="height" i]'
    ];
    
    for (const selector of altDimensionSelectors) {
      try {
        const found = findAllElements(selector);
        for (const element of found) {
          const testId = element.getAttribute('data-testid') || '';
          const className = (element.className || '').toLowerCase();
          const id = (element.id || '').toLowerCase();
          
          if (testId.includes('length') || className.includes('length') || id.includes('length')) {
            dimensionFields.length.push(element);
          } else if (testId.includes('width') || className.includes('width') || id.includes('width')) {
            dimensionFields.width.push(element);
          } else if (testId.includes('height') || className.includes('height') || id.includes('height')) {
            dimensionFields.height.push(element);
          }
        }
      } catch (e) {
        console.warn('Dimension selector failed:', selector, e);
      }
    }
    
    // Combine all dimension fields to find products
    const allDimensionFields = [
      ...dimensionFields.length,
      ...dimensionFields.width,
      ...dimensionFields.height
    ];
    const uniqueDimensionFields = [...new Set(allDimensionFields)];
    
    // Track products by anomaly type
    const multiOrderProducts = new Set();
    const sizeAnomalyProducts = new Set();
    const bothAnomalyProducts = new Set();
    
    // Group products by order ID
    const orderProducts = {};
    
    for (const field of uniqueDimensionFields) {
      try {
        const productRow = findProductRow(field);
        const orderId = findOrderId(field);
        
        if (orderId && productRow) {
          if (!orderProducts[orderId]) {
            orderProducts[orderId] = [];
          }
          if (!orderProducts[orderId].includes(productRow)) {
            orderProducts[orderId].push(productRow);
          }
        }
      } catch (e) {
        console.warn('Error processing dimension field:', e);
      }
    }
    
    // Mark products in orders with multiple products (multi-order)
    for (const orderId in orderProducts) {
      const products = orderProducts[orderId];
      if (products.length > 1) {
        for (const productRow of products) {
          multiOrderProducts.add(productRow);
        }
      }
    }
    
    // Find products with 12x18 or 18x12 in their name by checking product titles
    const productTitles = findAllElements('span[data-testid="line-item-title"]');
    const productsToUpdate = new Map(); // Track products that need weight/dimension updates: Map<productRow, {titleElement, isUnframed}>
    
    for (const titleElement of productTitles) {
      try {
        const titleText = (titleElement.textContent || '').toLowerCase();
        const titleHTML = (titleElement.innerHTML || '').toLowerCase();
        const combined = titleText + ' ' + titleHTML;
        
        // Check for 12x18 or 18x12 patterns in the product name
        const patterns = [
          /12\s*x\s*18/i,
          /18\s*x\s*12/i,
          /12x18/i,
          /18x12/i,
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
            // Check if product has "unframed" or "tape" in the title - if so, don't update weight/dimensions
            const isUnframed = combined.includes('unframed') || combined.includes('tape');
            productsToUpdate.set(productRow, { titleElement, isUnframed });
          }
        }
      } catch (e) {
        console.warn('Error checking product title for size anomaly:', e);
      }
    }
    
    // Find products that match both conditions
    for (const productRow of multiOrderProducts) {
      if (sizeAnomalyProducts.has(productRow)) {
        bothAnomalyProducts.add(productRow);
        multiOrderProducts.delete(productRow);
        sizeAnomalyProducts.delete(productRow);
      }
    }
    
    // Apply highlights
    for (const productRow of bothAnomalyProducts) {
      highlightRow(productRow, 'both');
    }
    
    for (const productRow of multiOrderProducts) {
      highlightRow(productRow, 'multi-order');
    }
    
    for (const productRow of sizeAnomalyProducts) {
      highlightRow(productRow, 'size-anomaly');
    }
    
    // Automatically update weight and dimensions for anomalies
    const weightValue = '890';
    const dimensions = {
      length: '50',
      width: '30',
      height: '2.9'
    };
    
    let weightUpdatedCount = 0;
    let dimensionsUpdatedCount = 0;
    let skippedUnframedCount = 0;
    
    // Helper to find fields near a title element
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
    
    // Update products with size anomalies (12x18/18x12) - but skip unframed/tape ones
    for (const productRow of sizeAnomalyProducts) {
      const productInfo = productsToUpdate.get(productRow);
      if (productInfo && !productInfo.isUnframed) {
        // Try updating via product row first
        let result = await updateProductFields(productRow, weightValue, dimensions);
        // If that didn't work, try finding fields near the title
        if (!result.weightUpdated || result.dimensionsUpdated < 2) {
          const titleResult = await updateFieldsNearTitle(productInfo.titleElement, weightValue, dimensions);
          if (titleResult.weightUpdated) result.weightUpdated = true;
          result.dimensionsUpdated = Math.max(result.dimensionsUpdated, titleResult.dimensionsUpdated);
        }
        if (result.weightUpdated) weightUpdatedCount++;
        if (result.dimensionsUpdated > 0) dimensionsUpdatedCount += result.dimensionsUpdated;
      } else if (productInfo && productInfo.isUnframed) {
        skippedUnframedCount++;
      }
    }
    
    // Update products in multi-order (but not if they're also size anomalies, to avoid double updates)
    for (const productRow of multiOrderProducts) {
      // Only update if it's not already a size anomaly product
      if (!sizeAnomalyProducts.has(productRow)) {
        let result = await updateProductFields(productRow, weightValue, dimensions);
        // If that didn't work, try to find a title element in this row and search near it
        const titleInRow = findAllElementsInContainer(productRow, 'span[data-testid="line-item-title"]');
        if (titleInRow.length > 0 && (!result.weightUpdated || result.dimensionsUpdated < 2)) {
          const titleResult = await updateFieldsNearTitle(titleInRow[0], weightValue, dimensions);
          if (titleResult.weightUpdated) result.weightUpdated = true;
          result.dimensionsUpdated = Math.max(result.dimensionsUpdated, titleResult.dimensionsUpdated);
        }
        if (result.weightUpdated) weightUpdatedCount++;
        if (result.dimensionsUpdated > 0) dimensionsUpdatedCount += result.dimensionsUpdated;
      }
    }
    
    // Update products that match both conditions
    for (const productRow of bothAnomalyProducts) {
      const productInfo = productsToUpdate.get(productRow);
      // Skip if it's unframed or tape
      if (!productInfo || !productInfo.isUnframed) {
        // Try updating via product row first
        let result = await updateProductFields(productRow, weightValue, dimensions);
        // If that didn't work, try finding fields near the title
        if (productInfo && (!result.weightUpdated || result.dimensionsUpdated < 2)) {
          const titleResult = await updateFieldsNearTitle(productInfo.titleElement, weightValue, dimensions);
          if (titleResult.weightUpdated) result.weightUpdated = true;
          result.dimensionsUpdated = Math.max(result.dimensionsUpdated, titleResult.dimensionsUpdated);
        }
        if (result.weightUpdated) weightUpdatedCount++;
        if (result.dimensionsUpdated > 0) dimensionsUpdatedCount += result.dimensionsUpdated;
      } else {
        skippedUnframedCount++;
      }
    }
    
    const totalHighlighted = bothAnomalyProducts.size + multiOrderProducts.size + sizeAnomalyProducts.size;
    
    if (totalHighlighted === 0) {
      return { 
        error: "No anomalies found.",
        totalHighlighted: 0,
        multiOrderCount: 0,
        sizeAnomalyCount: 0,
        weightUpdatedCount: 0,
        dimensionsUpdatedCount: 0
      };
    }
    
    return { 
      totalHighlighted: totalHighlighted,
      multiOrderCount: multiOrderProducts.size,
      sizeAnomalyCount: sizeAnomalyProducts.size,
      bothCount: bothAnomalyProducts.size,
      weightUpdatedCount: weightUpdatedCount,
      dimensionsUpdatedCount: dimensionsUpdatedCount,
      skippedUnframedCount: skippedUnframedCount
    };
  }
  
  /**
   * Function to highlight anomalies on the Orders page:
   * - Products in multi-order quantity (orders with multiple products)
   * - Products with 12x18 or 18x12 in their name
   * Uses different colors for each type
   * Does NOT update weights or dimensions (this is a different page)
   */
  async function highlightAnomaliesOrdersPage() {
    /**
     * Helper function to find all elements matching a selector, including in Shadow DOMs.
     */
    function findAllElements(selector) {
      let elements = [];
      
      const walker = document.createTreeWalker(
        document.body,
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
      
      document.querySelectorAll(selector).forEach(el => elements.push(el));
      return [...new Set(elements)];
    }
    
    /**
     * Helper function to find the order ID for a given element on the orders page
     */
    function findOrderId(element) {
      let container = element;
      for (let i = 0; i < 40; i++) {
        if (!container) break;
        
        const text = (container.textContent || '').trim();
        const id = (container.id || '').toLowerCase();
        const className = (container.className || '').toLowerCase();
        
        // Order ID pattern: 408-8530911-4304368 (3 groups of digits separated by hyphens)
        // Try to find it in the text, especially near "Order ID" or "Order" labels
        const orderIdMatch = text.match(/(?:order\s*(?:id|#)?\s*:?\s*)?(\d{3}-\d{7}-\d{7})/i);
        if (orderIdMatch) {
          return orderIdMatch[1];
        }
        
        // Also try the pattern without the label
        const directMatch = text.match(/(\d{3}-\d{7}-\d{7})/);
        if (directMatch) {
          return directMatch[1];
        }
        
        // Also check for order ID in attributes
        const dataOrderId = container.getAttribute('data-order-id') || 
                           container.getAttribute('data-orderid') ||
                           container.getAttribute('data-order-number');
        if (dataOrderId) {
          return dataOrderId;
        }
        
        // Check if element contains order ID pattern in its text
        if (id.includes('order') || className.includes('order') || className.includes('order-details')) {
          const numbers = text.match(/\d{3}-\d{7}-\d{7}/);
          if (numbers) {
            return numbers[0];
          }
        }
        
        container = container.parentElement;
      }
      return null;
    }
    
    /**
     * Helper function to find the row/container that groups a product on the orders page
     */
    function findProductRow(element) {
      let container = element;
      for (let i = 0; i < 20; i++) {
        if (!container) break;
        container = container.parentElement;
        if (!container) break;
        
        const className = (container.className || '').toLowerCase();
        const id = (container.id || '').toLowerCase();
        const tagName = container.tagName || '';
        
        // Look for table rows or product containers
        if (className.includes('row') || className.includes('item') || 
            className.includes('product') || className.includes('cell') ||
            className.includes('line-item') || className.includes('order-item') ||
            id.includes('row') || id.includes('item') ||
            tagName === 'TR' || tagName === 'TBODY') {
          return container;
        }
      }
      return element.closest('tr') || element.closest('td') || element.closest('div') || element;
    }
    
    /**
     * Helper function to check if a product name contains 12x18 or 18x12
     * Only matches exactly 12x18 or 18x12, not other dimensions like 12x8
     */
    function hasSizeAnomaly(element) {
      try {
        if (!element) return false;
        
        // Get ONLY the text content - don't check innerHTML to avoid false matches
        const text = (element.textContent || '').toLowerCase();
        
        // Very strict approach: search for the exact patterns
        // Split text into words/tokens and look for the exact dimension strings
        // This prevents partial matches
        
        // Normalize the text: replace multiple spaces with single space
        const normalized = text.replace(/\s+/g, ' ');
        
        // Check for exact matches of "12x18" or "18x12" (with or without spaces around x)
        // Must ensure it's not part of a larger number like "812x18" or "12x180"
        
        // Pattern 1: Look for "12x18" or "12 x 18" (with spaces)
        // Must be: start of string OR non-digit character, then 12, then x (with optional spaces), then 18, then end of string OR non-digit character
        const pattern12x18 = /(?:^|[^0-9])12\s*x\s*18(?:[^0-9]|$)/;
        const pattern18x12 = /(?:^|[^0-9])18\s*x\s*12(?:[^0-9]|$)/;
        
        // Also check without spaces: "12x18" and "18x12"
        const pattern12x18Direct = /(?:^|[^0-9])12x18(?:[^0-9]|$)/;
        const pattern18x12Direct = /(?:^|[^0-9])18x12(?:[^0-9]|$)/;
        
        // Test all patterns
        if (pattern12x18.test(normalized) || pattern12x18Direct.test(normalized)) {
          // Verify the match is exactly "12x18"
          const match = normalized.match(/(?:^|[^0-9])(12\s*x\s*18|12x18)(?:[^0-9]|$)/);
          if (match) {
            const dim = match[1].replace(/\s+/g, '').toLowerCase();
            if (dim === '12x18') {
              return true;
            }
          }
        }
        
        if (pattern18x12.test(normalized) || pattern18x12Direct.test(normalized)) {
          // Verify the match is exactly "18x12"
          const match = normalized.match(/(?:^|[^0-9])(18\s*x\s*12|18x12)(?:[^0-9]|$)/);
          if (match) {
            const dim = match[1].replace(/\s+/g, '').toLowerCase();
            if (dim === '18x12') {
              return true;
            }
          }
        }
      } catch (e) {
        console.warn('Error checking for size anomaly:', e);
      }
      return false;
    }
    
    /**
     * Helper function to highlight a row/container with a specific color
     */
    function highlightRow(container, colorType) {
      if (!container) return;
      try {
        // Remove existing highlights first
        container.style.backgroundColor = '';
        container.style.border = '';
        container.style.borderRadius = '';
        container.style.boxShadow = '';
        container.removeAttribute('data-amazon-extension-highlighted');
        container.removeAttribute('data-amazon-extension-highlight-type');
        
        if (colorType === 'multi-order') {
          // Yellow/orange for multi-order products
          container.style.backgroundColor = '#fff3cd';
          container.style.border = '3px solid #ff9900';
          container.style.borderRadius = '4px';
          container.style.boxShadow = '0 0 8px rgba(255, 153, 0, 0.4)';
          container.setAttribute('data-amazon-extension-highlighted', 'true');
          container.setAttribute('data-amazon-extension-highlight-type', 'multi-order');
        } else if (colorType === 'size-anomaly') {
          // Red/pink for 12x18/18x12 products
          container.style.backgroundColor = '#ffe6e6';
          container.style.border = '3px solid #ff6b6b';
          container.style.borderRadius = '4px';
          container.style.boxShadow = '0 0 8px rgba(255, 107, 107, 0.4)';
          container.setAttribute('data-amazon-extension-highlighted', 'true');
          container.setAttribute('data-amazon-extension-highlight-type', 'size-anomaly');
        } else if (colorType === 'both') {
          // Purple for products that match both conditions
          container.style.backgroundColor = '#e6e6ff';
          container.style.border = '3px solid #9b59b6';
          container.style.borderRadius = '4px';
          container.style.boxShadow = '0 0 8px rgba(155, 89, 182, 0.4)';
          container.setAttribute('data-amazon-extension-highlighted', 'true');
          container.setAttribute('data-amazon-extension-highlight-type', 'both');
        }
      } catch (e) {
        console.warn('Error highlighting row:', e);
      }
    }
    
    // First, remove any existing highlights
    const existingHighlights = document.querySelectorAll('[data-amazon-extension-highlighted="true"]');
    existingHighlights.forEach(el => {
      el.style.backgroundColor = '';
      el.style.border = '';
      el.style.borderRadius = '';
      el.style.boxShadow = '';
      el.removeAttribute('data-amazon-extension-highlighted');
      el.removeAttribute('data-amazon-extension-highlight-type');
    });
    
    // Find all product name cells on the orders page
    const productNameCells = findAllElements('.myo-list-orders-product-name-cell');
    
    if (productNameCells.length === 0) {
      return { 
        error: "No product cells found. Make sure you're on the Orders page.",
        totalHighlighted: 0,
        multiOrderCount: 0,
        sizeAnomalyCount: 0
      };
    }
    
    // Track products by anomaly type
    const multiOrderProducts = new Set();
    const sizeAnomalyProducts = new Set();
    const bothAnomalyProducts = new Set();
    
    // Group products by order ID
    const orderProducts = {};
    
    for (const productCell of productNameCells) {
      try {
        const productRow = findProductRow(productCell);
        const orderId = findOrderId(productCell);
        
        if (orderId && productRow) {
          if (!orderProducts[orderId]) {
            orderProducts[orderId] = [];
          }
          if (!orderProducts[orderId].includes(productRow)) {
            orderProducts[orderId].push(productRow);
          }
        }
      } catch (e) {
        console.warn('Error processing product cell:', e);
      }
    }
    
    // Mark products in orders with multiple products (multi-order)
    for (const orderId in orderProducts) {
      const products = orderProducts[orderId];
      if (products.length > 1) {
        for (const productRow of products) {
          multiOrderProducts.add(productRow);
        }
      }
    }
    
    // Find products with 12x18 or 18x12 in their name
    for (const productCell of productNameCells) {
      try {
        // Get the product name from the cell - only check the actual product title
        // The product title is in: a > div (the first div inside the anchor tag)
        // Try multiple selectors to find the product name element
        let productNameElement = null;
        
        // First try: a[href*="/gp/product/"] > div
        const productLink = productCell.querySelector('a[href*="/gp/product/"]');
        if (productLink) {
          productNameElement = productLink.querySelector('div:first-child') || 
                              productLink.querySelector('div');
        }
        
        // Fallback: try to find any anchor with a div inside
        if (!productNameElement) {
          const anyLink = productCell.querySelector('a');
          if (anyLink) {
            productNameElement = anyLink.querySelector('div');
          }
        }
        
        // Only check if we found the product name element - don't check the whole cell
        // as it contains ASIN, SKU, quantity, etc. which might have other dimensions
        if (productNameElement) {
          // Double-check: make sure we're only checking the product title text
          // and not other parts of the cell that might have dimensions
          const productText = (productNameElement.textContent || '').trim();
          
          // Only proceed if we have actual text content
          if (productText.length > 0 && hasSizeAnomaly(productNameElement)) {
            const productRow = findProductRow(productCell);
            if (productRow) {
              sizeAnomalyProducts.add(productRow);
            }
          }
        }
      } catch (e) {
        console.warn('Error checking product name for size anomaly:', e);
      }
    }
    
    // Find products that match both conditions
    for (const productRow of multiOrderProducts) {
      if (sizeAnomalyProducts.has(productRow)) {
        bothAnomalyProducts.add(productRow);
        multiOrderProducts.delete(productRow);
        sizeAnomalyProducts.delete(productRow);
      }
    }
    
    // Apply highlights
    for (const productRow of bothAnomalyProducts) {
      highlightRow(productRow, 'both');
    }
    
    for (const productRow of multiOrderProducts) {
      highlightRow(productRow, 'multi-order');
    }
    
    for (const productRow of sizeAnomalyProducts) {
      highlightRow(productRow, 'size-anomaly');
    }
    
    const totalHighlighted = bothAnomalyProducts.size + multiOrderProducts.size + sizeAnomalyProducts.size;
    
    if (totalHighlighted === 0) {
      return { 
        error: "No anomalies found.",
        totalHighlighted: 0,
        multiOrderCount: 0,
        sizeAnomalyCount: 0
      };
    }
    
    return { 
      totalHighlighted: totalHighlighted,
      multiOrderCount: multiOrderProducts.size,
      sizeAnomalyCount: sizeAnomalyProducts.size,
      bothCount: bothAnomalyProducts.size
    };
  }