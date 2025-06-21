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
      promotedTweet: '[data-testid="promotedTweet"]'
    },
    classes: {
      uxFixerApplied: 'ux-fixer-applied',
      uxFixerHidden: 'ux-fixer-hidden',
      uxFixerCompact: 'ux-fixer-compact',
      uxFixerMono: 'ux-fixer-mono',
      uxFixerHighContrast: 'ux-fixer-high-contrast'
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
    debugMode: false
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
    
    state.isApplied = true;
    log('X.com UX Fixer initialized successfully');
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
    
    log('Transformations applied');
  }

  /**
   * Transform the main feed container
   */
  function transformFeedContainer() {
    const primaryColumn = document.querySelector(CONFIG.selectors.primaryColumn);
    if (!primaryColumn) return;
    
    primaryColumn.classList.add(CONFIG.classes.uxFixerApplied);
    
    // Ensure full width
    primaryColumn.style.maxWidth = 'none';
    primaryColumn.style.width = '100%';
    
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
      });
      
      // Transform user names
      const userNames = tweet.querySelectorAll(CONFIG.selectors.userName);
      userNames.forEach(element => {
        element.classList.add(CONFIG.classes.uxFixerMono);
      });
      
      // Transform screen names and timestamps
      const screenNames = tweet.querySelectorAll(CONFIG.selectors.userScreenName);
      const timestamps = tweet.querySelectorAll('time');
      [...screenNames, ...timestamps].forEach(element => {
        element.classList.add(CONFIG.classes.uxFixerMono);
      });
    });
    
    log(`Transformed ${tweets.length} tweets`);
  }

  /**
   * Transform navigation sidebar
   */
  function transformNavigation() {
    const sidebar = document.querySelector(CONFIG.selectors.sidebarColumn);
    if (!sidebar) return;
    
    sidebar.classList.add(CONFIG.classes.uxFixerApplied);
    
    // Make navigation always visible on desktop
    if (window.innerWidth >= 1024) {
      sidebar.style.position = 'fixed';
      sidebar.style.left = '0';
      sidebar.style.top = '0';
      sidebar.style.height = '100vh';
      sidebar.style.width = '200px';
      sidebar.style.zIndex = '1000';
    }
    
    log('Navigation transformed');
  }

  /**
   * Transform action buttons
   */
  function transformActionButtons() {
    const buttons = document.querySelectorAll([
      CONFIG.selectors.likeButton,
      CONFIG.selectors.retweetButton,
      CONFIG.selectors.replyButton
    ].join(','));
    
    buttons.forEach(button => {
      if (button.classList.contains(CONFIG.classes.uxFixerApplied)) return;
      
      button.classList.add(CONFIG.classes.uxFixerApplied, CONFIG.classes.uxFixerCompact);
      
      // Add text labels if missing
      addButtonLabels(button);
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
    }
    
    if (label && !button.textContent.includes(label)) {
      const span = document.createElement('span');
      span.textContent = label;
      span.style.marginLeft = '4px';
      button.appendChild(span);
    }
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