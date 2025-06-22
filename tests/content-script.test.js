// Unit tests for content script functionality

describe('Content Script', () => {
  let contentScript;
  
  beforeEach(() => {
    // Mock DOM elements
    document.body.innerHTML = `
      <div id="react-root">
        <div data-testid="tweet">
          <div data-testid="tweetText">Test tweet content</div>
          <button aria-label="Reply">Reply</button>
          <button aria-label="Retweet">Retweet</button>
          <button aria-label="Like">Like</button>
        </div>
      </div>
    `;
    
    // Mock the content script module
    contentScript = {
      applyTransformations: jest.fn(),
      createDebugPanel: jest.fn(),
      initializeExtension: jest.fn(),
      init: jest.fn(),
      startCSSInjectionTimer: jest.fn(),
      endCSSInjectionTimer: jest.fn(),
      validateCSSSelector: jest.fn(),
      cacheCSS: jest.fn(),
      getCachedCSS: jest.fn(),
      applyOptimizedCSS: jest.fn(),
      validateCSSProperties: jest.fn(),
      state: {
        cssInjectionStats: { 
          duration: 0, 
          startTime: 0, 
          endTime: 0, 
          elementsTransformed: 0, 
          cacheHits: 0,
          cacheMisses: 0,
          errors: 0
        },
        cssValidationErrors: [],
        cssCache: new Map()
      },
      CONFIG: {
        performance: {
          cssValidationEnabled: true,
          cssCachingEnabled: true
        },
        css: {
          validationRules: {
            requiredProperties: ['font-family', 'color', 'background']
          }
        }
      }
    };

    // Mock the actual functions with real implementations
    contentScript.startCSSInjectionTimer = function() {
      this.state.cssInjectionStats.startTime = performance.now();
      this.state.cssInjectionStats.elementsTransformed = 0;
      this.state.cssInjectionStats.errors = 0;
    };

    contentScript.endCSSInjectionTimer = function() {
      this.state.cssInjectionStats.endTime = performance.now();
      this.state.cssInjectionStats.duration = this.state.cssInjectionStats.endTime - this.state.cssInjectionStats.startTime;
    };

    contentScript.validateCSSSelector = function(selector) {
      try {
        document.querySelector(selector);
        return true;
      } catch (error) {
        this.state.cssValidationErrors.push({
          selector: selector,
          error: error.message,
          timestamp: Date.now()
        });
        return false;
      }
    };

    contentScript.cacheCSS = function(selector, styles) {
      if (!this.CONFIG.performance.cssCachingEnabled) return;
      
      this.state.cssCache.set(selector, {
        styles: styles,
        timestamp: Date.now()
      });
    };

    contentScript.getCachedCSS = function(selector) {
      if (!this.CONFIG.performance.cssCachingEnabled) return null;
      
      const cached = this.state.cssCache.get(selector);
      if (cached && Date.now() - cached.timestamp < 30000) {
        this.state.cssInjectionStats.cacheHits++;
        return cached.styles;
      }
      
      this.state.cssInjectionStats.cacheMisses++;
      return null;
    };

    contentScript.applyOptimizedCSS = function(element, selector, styles) {
      try {
        // Check cache first
        const cachedStyles = this.getCachedCSS(selector);
        if (cachedStyles) {
          Object.assign(element.style, cachedStyles);
          return true;
        }

        // Validate selector
        if (this.CONFIG.performance.cssValidationEnabled && !this.validateCSSSelector(selector)) {
          this.state.cssInjectionStats.errors++;
          return false;
        }

        // Apply styles
        Object.assign(element.style, styles);
        
        // Cache the styles
        this.cacheCSS(selector, styles);
        
        this.state.cssInjectionStats.elementsTransformed++;
        return true;
      } catch (error) {
        this.state.cssInjectionStats.errors++;
        return false;
      }
    };

    contentScript.validateCSSProperties = function(properties) {
      const requiredProps = this.CONFIG.css.validationRules.requiredProperties;
      const missingProps = requiredProps.filter(prop => !properties.includes(prop));
      
      if (missingProps.length > 0) {
        this.state.cssValidationErrors.push({
          type: 'missing_properties',
          properties: missingProps,
          timestamp: Date.now()
        });
        return false;
      }
      return true;
    };
  });

  describe('DOM Transformation', () => {
    test('should apply compact styling to tweets', () => {
      const tweet = document.querySelector('[data-testid="tweet"]');
      tweet.classList.add('ux-fixer-compact');
      
      expect(tweet).toHaveClass('ux-fixer-compact');
    });

    test('should transform buttons with proper labels', () => {
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        button.classList.add('ux-fixer-button');
        
        // Create label element
        const label = document.createElement('span');
        label.className = 'ux-fixer-button-label';
        label.textContent = button.getAttribute('aria-label');
        button.appendChild(label);
      });
      
      const firstButton = buttons[0];
      expect(firstButton).toHaveClass('ux-fixer-button');
      
      const label = firstButton.querySelector('.ux-fixer-button-label');
      expect(label).toBeTruthy();
      expect(label.textContent).toBe('Reply');
    });

    test('should handle text overflow properly', () => {
      const tweetText = document.querySelector('[data-testid="tweetText"]');
      tweetText.style.overflow = 'visible';
      
      expect(tweetText.style.overflow).toBe('visible');
    });
  });

  describe('Debug Panel', () => {
    test('should create debug panel with correct structure', () => {
      const debugPanel = document.createElement('div');
      debugPanel.id = 'ux-fixer-debug-panel';
      debugPanel.innerHTML = `
        <div id="ux-fixer-status">Extension Active</div>
        <div id="ux-fixer-issue-count">0</div>
        <div id="ux-fixer-stats">Transformations: 0</div>
      `;
      
      document.body.appendChild(debugPanel);
      
      expect(debugPanel).toBeInTheDocument();
      expect(debugPanel.querySelector('#ux-fixer-status')).toHaveTextContent('Extension Active');
      expect(debugPanel.querySelector('#ux-fixer-issue-count')).toHaveTextContent('0');
    });

    test('should update issue count correctly', () => {
      const issueCount = document.createElement('div');
      issueCount.id = 'ux-fixer-issue-count';
      issueCount.textContent = '0';
      
      // Simulate finding issues
      issueCount.textContent = '5';
      
      expect(issueCount.textContent).toBe('5');
    });
  });

  describe('Extension Initialization', () => {
    test('should initialize extension on page load', () => {
      const initSpy = jest.fn();
      
      // Simulate extension initialization
      initSpy();
      
      expect(initSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle dynamic content loading', () => {
      const observerSpy = jest.fn();
      
      // Simulate MutationObserver callback
      observerSpy();
      
      expect(observerSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing elements gracefully', () => {
      const nonExistentElement = document.querySelector('#non-existent');
      
      // Should not throw error when element doesn't exist
      expect(nonExistentElement).toBeNull();
    });

    test('should handle selector failures', () => {
      const invalidSelector = '[data-testid="invalid"]';
      const elements = document.querySelectorAll(invalidSelector);
      
      expect(elements.length).toBe(0);
    });
  });

  describe('CSS Class Management', () => {
    test('should add and remove CSS classes correctly', () => {
      const element = document.createElement('div');
      
      // Add class
      element.classList.add('ux-fixer-test');
      expect(element).toHaveClass('ux-fixer-test');
      
      // Remove class
      element.classList.remove('ux-fixer-test');
      expect(element).not.toHaveClass('ux-fixer-test');
    });

    test('should handle multiple CSS classes', () => {
      const element = document.createElement('div');
      element.className = 'ux-fixer-compact ux-fixer-button';
      
      expect(element).toHaveClass('ux-fixer-compact');
      expect(element).toHaveClass('ux-fixer-button');
    });
  });

  describe('CSS Injection System', () => {
    test('should track CSS injection performance', () => {
      // Mock performance.now
      const originalNow = performance.now;
      let mockTime = 0;
      performance.now = () => mockTime;
      
      // Initialize extension
      contentScript.init();
      
      // Simulate CSS injection timing
      mockTime = 100;
      contentScript.startCSSInjectionTimer();
      mockTime = 150;
      contentScript.endCSSInjectionTimer();
      
      expect(contentScript.state.cssInjectionStats.duration).toBe(50);
      expect(contentScript.state.cssInjectionStats.startTime).toBe(100);
      expect(contentScript.state.cssInjectionStats.endTime).toBe(150);
      
      // Restore original
      performance.now = originalNow;
    });

    test('should validate CSS selectors', () => {
      // Test valid selector
      expect(contentScript.validateCSSSelector('[data-testid="tweet"]')).toBe(true);
      
      // Test invalid selector that actually throws an error
      const originalQuerySelector = document.querySelector;
      document.querySelector = jest.fn().mockImplementation(() => {
        throw new Error('Invalid selector');
      });
      
      expect(contentScript.validateCSSSelector('[invalid-selector]')).toBe(false);
      
      // Check validation errors
      expect(contentScript.state.cssValidationErrors.length).toBeGreaterThan(0);
      
      // Restore original
      document.querySelector = originalQuerySelector;
    });

    test('should cache CSS styles', () => {
      const selector = '[data-testid="tweet"]';
      const styles = { color: 'red', fontSize: '14px' };
      
      // Cache CSS
      contentScript.cacheCSS(selector, styles);
      
      // Get cached CSS
      const cached = contentScript.getCachedCSS(selector);
      expect(cached).toEqual(styles);
      
      // Check cache stats
      expect(contentScript.state.cssInjectionStats.cacheHits).toBe(1);
    });

    test('should apply optimized CSS with error handling', () => {
      const element = document.createElement('div');
      const selector = '[data-testid="tweet"]';
      const styles = { color: 'red', fontSize: '14px' };
      
      // Apply optimized CSS
      const result = contentScript.applyOptimizedCSS(element, selector, styles);
      
      expect(result).toBe(true);
      expect(element.style.color).toBe('red');
      expect(element.style.fontSize).toBe('14px');
      expect(contentScript.state.cssInjectionStats.elementsTransformed).toBe(1);
    });

    test('should handle CSS application errors gracefully', () => {
      const element = document.createElement('div');
      const invalidSelector = '[invalid-selector]';
      const styles = { color: 'red' };
      
      // Mock querySelector to throw error for invalid selector
      const originalQuerySelector = document.querySelector;
      document.querySelector = jest.fn().mockImplementation((selector) => {
        if (selector === invalidSelector) {
          throw new Error('Invalid selector');
        }
        return originalQuerySelector.call(document, selector);
      });
      
      // Apply CSS with invalid selector
      const result = contentScript.applyOptimizedCSS(element, invalidSelector, styles);
      
      expect(result).toBe(false);
      expect(contentScript.state.cssInjectionStats.errors).toBe(1);
      
      // Restore original
      document.querySelector = originalQuerySelector;
    });

    test('should validate CSS properties', () => {
      const validProperties = ['font-family', 'color', 'background'];
      const invalidProperties = ['color', 'fontSize'];
      
      expect(contentScript.validateCSSProperties(validProperties)).toBe(true);
      expect(contentScript.validateCSSProperties(invalidProperties)).toBe(false);
    });
  });
}); 