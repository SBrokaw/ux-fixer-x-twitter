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
      mutationThrottle: 50
    }
  };

  // State management
  let state = {
    isApplied: false,
    observerActive: false,
    performanceMode: false,
    debugMode: false,
    debugPanel: null
  };

  /**
   * Main initialization function
   */
  function init() {
    if (state.isApplied) return;
    
    log('Initializing X.com UX Fixer...');
    
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
    extensionStatus.innerHTML = `
      <div style="color: #6bff6b; font-weight: bold;">UX Fixer Status</div>
      <div style="color: #ffa; font-size: 10px;">
        Applied: ${state.isApplied ? 'Yes' : 'No'}<br>
        Performance Mode: ${state.performanceMode ? 'On' : 'Off'}<br>
        Tweets Transformed: ${document.querySelectorAll(CONFIG.selectors.tweets).length}<br>
        Buttons Transformed: ${document.querySelectorAll(`${CONFIG.selectors.likeButton}, ${CONFIG.selectors.retweetButton}, ${CONFIG.selectors.replyButton}`).length}
      </div>
    `;
    
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

})(); 