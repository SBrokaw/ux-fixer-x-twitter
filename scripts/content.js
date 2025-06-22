/**
 * X.com UX Fixer - Content Script
 * Transforms X.com into a dense, efficient, text-based interface
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    selectors: {
      primaryColumn: '[data-testid="primaryColumn"]',
      sidebarColumn: '[data-testid="sidebarColumn"]',
      tweets: '[data-testid="tweet"]',
      tweetText: '[data-testid="tweetText"]',
      userName: '[data-testid="User-Name"]',
      userScreenName: '[data-testid="UserScreenName"]',
      likeButton: '[data-testid="like"]',
      retweetButton: '[data-testid="retweet"]',
      replyButton: '[data-testid="reply"]',
      appTabBar: '[data-testid="AppTabBar"]',
      promotedTweet: '[data-testid="promotedTweet"]',
      // Additional selectors for better coverage
      userAvatar: '[data-testid="Tweet-User-Avatar"]',
      bookmarkButton: '[data-testid="bookmark"]',
      shareButton: '[data-testid="share"]',
      moreButton: '[data-testid="caret"]'
    },
    classes: {
      uxFixerApplied: 'ux-fixer-applied',
      uxFixerHidden: 'ux-fixer-hidden',
      uxFixerCompact: 'ux-fixer-compact',
      uxFixerMono: 'ux-fixer-mono',
      uxFixerHighContrast: 'ux-fixer-high-contrast',
      uxFixerDense: 'ux-fixer-dense'
    },
    performance: {
      observerThrottle: 100,
      mutationThrottle: 50,
      cssInjectionTimeout: 5000,
      cssValidationEnabled: true,
      cssCachingEnabled: true
    },
    css: {
      version: '1.0.0',
      cacheKey: 'ux-fixer-css-cache',
      validationRules: {
        maxSelectorLength: 100,
        maxImportantDeclarations: 50,
        requiredProperties: ['font-family', 'color', 'background']
      }
    }
  };

  // State management
  let state = {
    isApplied: false,
    observerActive: false,
    performanceMode: false,
    debugMode: false,
    debugPanel: null,
    cssInjectionStats: {
      startTime: 0,
      endTime: 0,
      duration: 0,
      elementsTransformed: 0,
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0
    },
    cssCache: new Map(),
    cssValidationErrors: []
  };

  /**
   * Main initialization function
   */
  function init() {
    if (state.isApplied) return;
    
    log('Initializing X.com UX Fixer...');
    
    // Add immediate visual feedback to verify script is running
    addVisualFeedback();
    
    // Inject CSS directly via JavaScript to bypass CSP issues
    injectCSSDirectly();
    
    // Start CSS injection performance monitoring
    startCSSInjectionTimer();
    monitorCSSPerformance();
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyTransformations);
    } else {
      applyTransformations();
    }
    
    // Set up observers for dynamic content
    setupObservers();
    
    // Add keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Add performance monitoring
    setupPerformanceMonitoring();
    
    // Initialize debug integration
    initDebugIntegration();
    
    // Notify background script
    notifyBackgroundScript();
    
    state.isApplied = true;
    log('X.com UX Fixer initialized successfully');
  }

  /**
   * Notify background script of successful initialization
   */
  function notifyBackgroundScript() {
    try {
      if (typeof browser !== 'undefined' && browser.runtime) {
        browser.runtime.sendMessage({
          type: 'DEBUG_INFO',
          data: {
            status: 'initialized',
            url: window.location.href,
            timestamp: Date.now()
          }
        });
      }
    } catch (error) {
      log('Failed to notify background script:', error);
    }
  }

  /**
   * Initialize debug panel integration
   */
  function initDebugIntegration() {
    // Wait for debug panel to be available
    const checkDebugPanel = () => {
      const debugPanel = document.getElementById('ux-fixer-debug-panel');
      if (debugPanel) {
        state.debugPanel = debugPanel;
        log('Debug panel integration initialized');
        
        // Add our own debug info to the panel
        addDebugInfo();
      } else {
        setTimeout(checkDebugPanel, 1000);
      }
    };
    
    checkDebugPanel();
  }

  /**
   * Add debug information to the debug panel
   */
  function addDebugInfo() {
    if (!state.debugPanel) return;
    
    const debugContent = document.getElementById('debug-content');
    if (!debugContent) return;
    
    // Add our extension status
    const extensionStatus = document.createElement('div');
    extensionStatus.style.cssText = 'margin-top: 10px; padding: 5px; background: #333; border-radius: 3px;';
    
    // Create status header
    const statusHeader = document.createElement('div');
    statusHeader.style.cssText = 'color: #6bff6b; font-weight: bold;';
    statusHeader.textContent = 'UX Fixer Status';
    extensionStatus.appendChild(statusHeader);
    
    // Create status details
    const statusDetails = document.createElement('div');
    statusDetails.style.cssText = 'color: #ffa; font-size: 10px;';
    statusDetails.textContent = `Applied: ${state.isApplied ? 'Yes' : 'No'}\nPerformance Mode: ${state.performanceMode ? 'On' : 'Off'}\nTweets Transformed: ${document.querySelectorAll(CONFIG.selectors.tweets).length}\nButtons Transformed: ${document.querySelectorAll(`${CONFIG.selectors.likeButton}, ${CONFIG.selectors.retweetButton}, ${CONFIG.selectors.replyButton}`).length}`;
    extensionStatus.appendChild(statusDetails);
    
    // Add CSS performance stats
    const cssStats = document.createElement('div');
    cssStats.style.cssText = 'color: #ffa; font-size: 10px; margin-top: 5px;';
    cssStats.textContent = `CSS Injection: ${state.cssInjectionStats.duration.toFixed(2)}ms\nElements: ${state.cssInjectionStats.elementsTransformed}\nCache: ${state.cssInjectionStats.cacheHits}/${state.cssInjectionStats.cacheHits + state.cssInjectionStats.cacheMisses}\nErrors: ${state.cssInjectionStats.errors}`;
    extensionStatus.appendChild(cssStats);
    
    // Add CSS validation errors if any
    if (state.cssValidationErrors.length > 0) {
      const cssErrors = document.createElement('div');
      cssErrors.style.cssText = 'color: #ff6b6b; font-size: 10px; margin-top: 5px;';
      cssErrors.textContent = `CSS Errors: ${state.cssValidationErrors.length}`;
      extensionStatus.appendChild(cssErrors);
    }
    
    debugContent.appendChild(extensionStatus);
  }

  /**
   * Apply all transformations to the page
   */
  function applyTransformations() {
    log('Applying transformations...');
    
    // Apply to existing content
    transformFeedContainer();
    transformTweets();
    transformNavigation();
    transformActionButtons();
    removePromotionalContent();
    
    // Add skip links for accessibility
    addSkipLinks();
    
    // End CSS injection performance monitoring
    endCSSInjectionTimer();
    
    // Update debug panel
    if (state.debugPanel) {
      addDebugInfo();
    }
    
    log('Transformations applied');
  }

  /**
   * Transform the main feed container
   */
  function transformFeedContainer() {
    const primaryColumn = document.querySelector(CONFIG.selectors.primaryColumn);
    if (!primaryColumn) {
      log('Primary column not found');
      return;
    }
    
    primaryColumn.classList.add(CONFIG.classes.uxFixerApplied, CONFIG.classes.uxFixerDense);
    
    // Ensure full width and proper spacing
    primaryColumn.style.maxWidth = 'none';
    primaryColumn.style.width = '100%';
    primaryColumn.style.padding = '0';
    primaryColumn.style.margin = '0';
    
    log('Feed container transformed');
  }

  /**
   * Transform all tweet elements
   */
  function transformTweets() {
    const tweets = document.querySelectorAll(CONFIG.selectors.tweets);
    
    tweets.forEach(tweet => {
      if (tweet.classList.contains(CONFIG.classes.uxFixerApplied)) return;
      
      tweet.classList.add(CONFIG.classes.uxFixerApplied, CONFIG.classes.uxFixerCompact);
      
      // Apply monospace font to text elements
      const textElements = tweet.querySelectorAll(CONFIG.selectors.tweetText);
      textElements.forEach(element => {
        element.classList.add(CONFIG.classes.uxFixerMono);
        // Ensure proper text wrapping
        element.style.whiteSpace = 'pre-wrap';
        element.style.wordWrap = 'break-word';
        element.style.overflowWrap = 'break-word';
      });
      
      // Transform user names
      const userNames = tweet.querySelectorAll(CONFIG.selectors.userName);
      userNames.forEach(element => {
        element.classList.add(CONFIG.classes.uxFixerMono);
        // Ensure proper spacing
        element.style.marginBottom = '2px';
      });
      
      // Transform screen names and timestamps
      const screenNames = tweet.querySelectorAll(CONFIG.selectors.userScreenName);
      const timestamps = tweet.querySelectorAll('time');
      [...screenNames, ...timestamps].forEach(element => {
        element.classList.add(CONFIG.classes.uxFixerMono);
        element.style.fontSize = '12px';
        element.style.color = '#536471';
      });
      
      // Ensure proper spacing between elements
      const tweetContent = tweet.querySelector('[data-testid="tweetText"]');
      if (tweetContent) {
        tweetContent.style.marginTop = '4px';
        tweetContent.style.marginBottom = '8px';
      }
    });
    
    log(`Transformed ${tweets.length} tweets`);
  }

  /**
   * Transform navigation sidebar
   */
  function transformNavigation() {
    const sidebar = document.querySelector(CONFIG.selectors.sidebarColumn);
    if (!sidebar) {
      log('Sidebar not found');
      return;
    }
    
    sidebar.classList.add(CONFIG.classes.uxFixerApplied);
    
    // Make navigation always visible on desktop
    if (window.innerWidth >= 1024) {
      sidebar.style.position = 'fixed';
      sidebar.style.left = '0';
      sidebar.style.top = '0';
      sidebar.style.height = '100vh';
      sidebar.style.width = '200px';
      sidebar.style.zIndex = '1000';
      sidebar.style.backgroundColor = '#ffffff';
      sidebar.style.borderRight = '1px solid #e1e8ed';
    }
    
    log('Navigation transformed');
  }

  /**
   * Transform action buttons
   */
  function transformActionButtons() {
    const buttonSelectors = [
      CONFIG.selectors.likeButton,
      CONFIG.selectors.retweetButton,
      CONFIG.selectors.replyButton,
      CONFIG.selectors.bookmarkButton,
      CONFIG.selectors.shareButton
    ].join(',');
    
    const buttons = document.querySelectorAll(buttonSelectors);
    
    buttons.forEach(button => {
      if (button.classList.contains(CONFIG.classes.uxFixerApplied)) return;
      
      button.classList.add(CONFIG.classes.uxFixerApplied, CONFIG.classes.uxFixerCompact);
      
      // Add text labels if missing
      addButtonLabels(button);
      
      // Ensure proper button styling
      button.style.padding = '8px 12px';
      button.style.margin = '2px';
      button.style.borderRadius = '4px';
      button.style.border = '1px solid transparent';
      button.style.backgroundColor = 'transparent';
      button.style.cursor = 'pointer';
      
      // Ensure button is visible and clickable
      button.style.display = 'inline-flex';
      button.style.alignItems = 'center';
      button.style.justifyContent = 'center';
      button.style.minHeight = '32px';
      button.style.minWidth = '32px';
    });
    
    log(`Transformed ${buttons.length} action buttons`);
  }

  /**
   * Add text labels to action buttons
   */
  function addButtonLabels(button) {
    const testId = button.getAttribute('data-testid');
    let label = '';
    
    switch (testId) {
      case 'like':
        label = 'Like';
        break;
      case 'retweet':
        label = 'Retweet';
        break;
      case 'reply':
        label = 'Reply';
        break;
      case 'bookmark':
        label = 'Bookmark';
        break;
      case 'share':
        label = 'Share';
        break;
      default:
        return; // Don't add label for unknown buttons
    }
    
    // Check if label already exists
    const existingLabel = button.querySelector('.ux-fixer-button-label');
    if (existingLabel) return;
    
    const span = document.createElement('span');
    span.textContent = label;
    span.className = 'ux-fixer-button-label';
    span.style.cssText = `
      margin-left: 4px;
      font-size: 12px;
      font-family: monospace;
      color: inherit;
    `;
    
    button.appendChild(span);
  }

  /**
   * Remove promotional content
   */
  function removePromotionalContent() {
    const promotedTweets = document.querySelectorAll(CONFIG.selectors.promotedTweet);
    
    promotedTweets.forEach(tweet => {
      tweet.classList.add(CONFIG.classes.uxFixerHidden);
    });
    
    if (promotedTweets.length > 0) {
      log(`Hidden ${promotedTweets.length} promotional tweets`);
    }
  }

  /**
   * Add skip links for accessibility
   */
  function addSkipLinks() {
    if (document.querySelector('.skip-link')) return;
    
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content anchor
    const primaryColumn = document.querySelector(CONFIG.selectors.primaryColumn);
    if (primaryColumn) {
      primaryColumn.id = 'main-content';
    }
    
    log('Skip links added');
  }

  /**
   * Set up observers for dynamic content
   */
  function setupObservers() {
    if (state.observerActive) return;
    
    // Mutation observer for new content
    const observer = new MutationObserver(throttle((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check for new tweets
              if (node.matches && node.matches(CONFIG.selectors.tweets)) {
                transformTweets();
              }
              
              // Check for new content within existing tweets
              if (node.querySelectorAll) {
                const newTweets = node.querySelectorAll(CONFIG.selectors.tweets);
                if (newTweets.length > 0) {
                  transformTweets();
                }
              }
            }
          });
        }
      });
    }, CONFIG.performance.mutationThrottle));
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    state.observerActive = true;
    log('Observers set up');
  }

  /**
   * Set up keyboard shortcuts
   */
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Toggle performance mode with Ctrl+Shift+P
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        togglePerformanceMode();
      }
      
      // Toggle debug mode with Ctrl+Shift+D
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        toggleDebugMode();
      }
    });
    
    log('Keyboard shortcuts set up');
  }

  /**
   * Toggle performance mode
   */
  function togglePerformanceMode() {
    state.performanceMode = !state.performanceMode;
    
    if (state.performanceMode) {
      document.body.classList.add('ux-fixer-performance-mode');
      log('Performance mode enabled');
    } else {
      document.body.classList.remove('ux-fixer-performance-mode');
      log('Performance mode disabled');
    }
  }

  /**
   * Toggle debug mode
   */
  function toggleDebugMode() {
    state.debugMode = !state.debugMode;
    log(`Debug mode ${state.debugMode ? 'enabled' : 'disabled'}`);
  }

  /**
   * Set up performance monitoring
   */
  function setupPerformanceMonitoring() {
    // Monitor scroll performance
    let scrollCount = 0;
    let lastScrollTime = Date.now();
    
    window.addEventListener('scroll', throttle(() => {
      scrollCount++;
      const now = Date.now();
      
      if (now - lastScrollTime > 1000) {
        if (state.debugMode) {
          log(`Scroll events per second: ${scrollCount}`);
        }
        scrollCount = 0;
        lastScrollTime = now;
      }
    }, CONFIG.performance.observerThrottle));
    
    log('Performance monitoring set up');
  }

  /**
   * Utility function to throttle function calls
   */
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Logging function
   */
  function log(message) {
    if (state.debugMode) {
      console.log(`[X.com UX Fixer] ${message}`);
    }
  }

  /**
   * Error handling
   */
  function handleError(error) {
    console.error('[X.com UX Fixer] Error:', error);
  }

  // Initialize when script loads
  try {
    init();
  } catch (error) {
    handleError(error);
  }

  // Export for potential external use
  window.XComUXFixer = {
    init,
    applyTransformations,
    togglePerformanceMode,
    toggleDebugMode,
    state: () => ({ ...state })
  };

  /**
   * CSS Injection Performance Monitoring
   */
  function startCSSInjectionTimer() {
    state.cssInjectionStats.startTime = performance.now();
    state.cssInjectionStats.elementsTransformed = 0;
    state.cssInjectionStats.errors = 0;
  }

  function endCSSInjectionTimer() {
    state.cssInjectionStats.endTime = performance.now();
    state.cssInjectionStats.duration = state.cssInjectionStats.endTime - state.cssInjectionStats.startTime;
    
    if (state.debugMode) {
      log(`CSS injection completed in ${state.cssInjectionStats.duration.toFixed(2)}ms`);
      log(`Elements transformed: ${state.cssInjectionStats.elementsTransformed}`);
      log(`Cache hits: ${state.cssInjectionStats.cacheHits}, misses: ${state.cssInjectionStats.cacheMisses}`);
    }
  }

  /**
   * CSS Validation and Error Handling
   */
  function validateCSSSelector(selector) {
    try {
      // Test if selector is valid
      document.querySelector(selector);
      return true;
    } catch (error) {
      state.cssValidationErrors.push({
        selector: selector,
        error: error.message,
        timestamp: Date.now()
      });
      return false;
    }
  }

  function validateCSSProperties(properties) {
    const requiredProps = CONFIG.css.validationRules.requiredProperties;
    const missingProps = requiredProps.filter(prop => !properties.includes(prop));
    
    if (missingProps.length > 0) {
      state.cssValidationErrors.push({
        type: 'missing_properties',
        properties: missingProps,
        timestamp: Date.now()
      });
      return false;
    }
    return true;
  }

  /**
   * CSS Caching System
   */
  function getCachedCSS(selector) {
    if (!CONFIG.performance.cssCachingEnabled) return null;
    
    const cached = state.cssCache.get(selector);
    if (cached && Date.now() - cached.timestamp < 30000) { // 30 second cache
      state.cssInjectionStats.cacheHits++;
      return cached.styles;
    }
    
    state.cssInjectionStats.cacheMisses++;
    return null;
  }

  function cacheCSS(selector, styles) {
    if (!CONFIG.performance.cssCachingEnabled) return;
    
    state.cssCache.set(selector, {
      styles: styles,
      timestamp: Date.now()
    });
  }

  /**
   * Optimized CSS Application
   */
  function applyOptimizedCSS(element, selector, styles) {
    try {
      // Check cache first
      const cachedStyles = getCachedCSS(selector);
      if (cachedStyles) {
        Object.assign(element.style, cachedStyles);
        return true;
      }

      // Validate selector
      if (CONFIG.performance.cssValidationEnabled && !validateCSSSelector(selector)) {
        state.cssInjectionStats.errors++;
        return false;
      }

      // Apply styles with error handling
      const styleProperties = Object.keys(styles);
      if (CONFIG.performance.cssValidationEnabled && !validateCSSProperties(styleProperties)) {
        state.cssInjectionStats.errors++;
        return false;
      }

      // Apply styles
      Object.assign(element.style, styles);
      
      // Cache the styles
      cacheCSS(selector, styles);
      
      state.cssInjectionStats.elementsTransformed++;
      return true;
    } catch (error) {
      state.cssInjectionStats.errors++;
      log(`CSS application error for ${selector}:`, error);
      return false;
    }
  }

  /**
   * CSS Performance Monitoring
   */
  function monitorCSSPerformance() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('CSS') || entry.name.includes('style')) {
          if (state.debugMode) {
            log(`CSS performance: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
          }
        }
      }
    });
    
    try {
      observer.observe({ entryTypes: ['measure', 'paint'] });
    } catch (error) {
      log('CSS performance monitoring not supported:', error);
    }
  }

  /**
   * Add immediate visual feedback to verify script execution
   */
  function addVisualFeedback() {
    // Create a visible indicator that the script is running
    const indicator = document.createElement('div');
    indicator.id = 'ux-fixer-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #1da1f2;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    indicator.textContent = 'UX Fixer Active';
    
    // Add to page
    document.body.appendChild(indicator);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 5000);
    
    log('Visual feedback indicator added');
  }

  /**
   * Inject CSS directly via JavaScript to bypass CSP issues
   */
  function injectCSSDirectly() {
    const css = `
      /* X.com UX Fixer - Direct CSS Injection */
      
      /* Critical Performance Optimizations */
      * {
        animation: none !important;
        transition: none !important;
        transform: none !important;
      }
      
      /* Essential transitions only */
      [data-testid="like"]:hover,
      [data-testid="retweet"]:hover,
      [data-testid="reply"]:hover {
        transition: background-color 0.1s ease !important;
      }
      
      /* Main Feed Container */
      [data-testid="primaryColumn"] {
        max-width: none !important;
        width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
        background: #ffffff !important;
        will-change: scroll-position !important;
        transform: translateZ(0) !important;
        backface-visibility: hidden !important;
      }
      
      /* Remove decorative backgrounds */
      [data-testid="primaryColumn"] > div {
        background: none !important;
        box-shadow: none !important;
      }
      
      /* Tweet Container */
      [data-testid="tweet"] {
        padding: 8px 12px !important;
        margin: 0 !important;
        border-bottom: 1px solid #e1e8ed !important;
        background: transparent !important;
        contain: layout style paint !important;
        position: relative !important;
        z-index: 1 !important;
        overflow: visible !important;
      }
      
      /* Tweet Layout */
      [data-testid="tweet"] article {
        display: grid !important;
        grid-template-columns: auto 1fr auto !important;
        gap: 8px !important;
        align-items: start !important;
        position: relative !important;
        overflow: visible !important;
      }
      
      /* Tweet Content */
      [data-testid="tweet"] > div {
        padding: 0 !important;
        margin: 0 !important;
        position: relative !important;
        overflow: visible !important;
      }
      
      /* Tweet Text */
      [data-testid="tweetText"] {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
        color: #000000 !important;
        font-weight: 400 !important;
        margin: 4px 0 8px 0 !important;
        padding: 0 !important;
        display: block !important;
        overflow: visible !important;
        white-space: pre-wrap !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        min-height: 1em !important;
        position: relative !important;
        z-index: 2 !important;
        max-width: 100% !important;
      }
      
      /* Username */
      [data-testid="User-Name"] {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
        font-size: 13px !important;
        font-weight: 600 !important;
        color: #000000 !important;
        margin: 0 0 2px 0 !important;
        padding: 0 !important;
        display: block !important;
        position: relative !important;
        z-index: 2 !important;
        overflow: visible !important;
        white-space: nowrap !important;
        text-overflow: ellipsis !important;
      }
      
      /* Timestamps and Screen Names */
      time, [data-testid="UserScreenName"] {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
        font-size: 12px !important;
        color: #657786 !important;
        margin: 0 !important;
        padding: 0 !important;
        display: inline-block !important;
        position: relative !important;
        z-index: 2 !important;
        overflow: visible !important;
      }
      
      /* Navigation Sidebar */
      [data-testid="sidebarColumn"] {
        position: fixed !important;
        left: 0 !important;
        top: 0 !important;
        height: 100vh !important;
        width: 200px !important;
        background: #ffffff !important;
        border-right: 1px solid #e1e8ed !important;
        z-index: 1000 !important;
      }
      
      /* Navigation Links */
      [data-testid="AppTabBar"] a {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        padding: 12px 16px !important;
        color: #000000 !important;
        text-decoration: none !important;
        font-weight: 500 !important;
        border-radius: 0 !important;
        transition: background-color 0.1s ease !important;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
        font-size: 14px !important;
      }
      
      [data-testid="AppTabBar"] a:hover {
        background: #f7f9fa !important;
      }
      
      /* Action Buttons */
      [data-testid="like"], [data-testid="retweet"], [data-testid="reply"], [data-testid="bookmark"], [data-testid="share"] {
        background: transparent !important;
        border: none !important;
        padding: 8px !important;
        margin: 0 4px !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
        font-size: 12px !important;
        color: #657786 !important;
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
        min-width: auto !important;
        width: auto !important;
        height: auto !important;
      }
      
      /* Hide promotional content */
      [data-testid="promotedTweet"] {
        display: none !important;
      }
      
      /* Responsive Design */
      @media (max-width: 767px) {
        [data-testid="primaryColumn"] {
          width: 100% !important;
          margin-left: 0 !important;
        }
        
        [data-testid="tweet"] {
          padding: 6px 8px !important;
        }
        
        [data-testid="tweetText"] {
          font-size: 13px !important;
        }
      }
    `;
    
    const style = document.createElement('style');
    style.id = 'ux-fixer-direct-css';
    style.textContent = css;
    document.head.appendChild(style);
    
    log('CSS injected directly via JavaScript');
  }

})(); 