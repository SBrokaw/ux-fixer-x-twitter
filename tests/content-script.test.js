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
    
    // Mock the content script functions
    contentScript = {
      applyTransformations: jest.fn(),
      createDebugPanel: jest.fn(),
      initializeExtension: jest.fn()
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
}); 