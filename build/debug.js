/**
 * X.com UX Fixer - Debug Script
 * Automatically detects and reports common issues
 */

(function() {
  'use strict';

  const DEBUG = {
    enabled: true,
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    autoRun: true,
    interval: 5000 // Check every 5 seconds
  };

  const ISSUES = {
    textOverlap: [],
    brokenButtons: [],
    layoutIssues: [],
    cssConflicts: [],
    selectorFailures: []
  };

  /**
   * Main debug initialization
   */
  function initDebug() {
    if (!DEBUG.enabled) return;
    
    console.log('🔍 X.com UX Fixer Debug Mode Enabled');
    
    // Add debug panel to page
    addDebugPanel();
    
    // Run initial check
    runDebugChecks();
    
    // Set up periodic checks
    if (DEBUG.autoRun) {
      setInterval(runDebugChecks, DEBUG.interval);
    }
    
    // Add keyboard shortcut for manual check
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        runDebugChecks();
      }
    });
  }

  /**
   * Add debug panel to page
   */
  function addDebugPanel() {
    const panel = document.createElement('div');
    panel.id = 'ux-fixer-debug-panel';
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 400px;
      background: #000;
      color: #fff;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 5px;
      z-index: 10000;
      overflow-y: auto;
      border: 2px solid #ff0;
    `;
    
    panel.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 10px; color: #ff0;">
        🔍 UX Fixer Debug Panel
      </div>
      <div id="debug-content">
        <div>Loading...</div>
      </div>
      <div style="margin-top: 10px; font-size: 10px; color: #888;">
        Press Ctrl+Shift+D to refresh
      </div>
    `;
    
    document.body.appendChild(panel);
  }

  /**
   * Run all debug checks
   */
  function runDebugChecks() {
    log('Running debug checks...');
    
    // Clear previous issues
    Object.keys(ISSUES).forEach(key => ISSUES[key] = []);
    
    // Run checks
    checkTextOverlap();
    checkBrokenButtons();
    checkLayoutIssues();
    checkCSSConflicts();
    checkSelectorFailures();
    
    // Update debug panel
    updateDebugPanel();
    
    // Log summary
    logSummary();
  }

  /**
   * Check for text overlapping issues
   */
  function checkTextOverlap() {
    const textElements = document.querySelectorAll('[data-testid="tweetText"], [data-testid="User-Name"], [data-testid="UserScreenName"]');
    
    textElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      
      // Check if element is visible
      if (rect.width === 0 || rect.height === 0) {
        ISSUES.textOverlap.push({
          type: 'invisible',
          element: element,
          selector: getElementSelector(element),
          message: 'Text element has zero dimensions'
        });
        return;
      }
      
      // Check for overflow
      if (element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight) {
        ISSUES.textOverlap.push({
          type: 'overflow',
          element: element,
          selector: getElementSelector(element),
          message: 'Text content overflows container'
        });
      }
      
      // Check for overlapping with other elements
      textElements.forEach((otherElement, otherIndex) => {
        if (index === otherIndex) return;
        
        const otherRect = otherElement.getBoundingClientRect();
        
        if (rectsOverlap(rect, otherRect)) {
          ISSUES.textOverlap.push({
            type: 'overlap',
            element: element,
            selector: getElementSelector(element),
            message: `Overlaps with ${getElementSelector(otherElement)}`
          });
        }
      });
    });
  }

  /**
   * Check for broken buttons
   */
  function checkBrokenButtons() {
    const buttons = document.querySelectorAll('[data-testid="like"], [data-testid="retweet"], [data-testid="reply"]');
    
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      const style = window.getComputedStyle(button);
      
      // Check if button is clickable
      if (rect.width === 0 || rect.height === 0) {
        ISSUES.brokenButtons.push({
          type: 'invisible',
          element: button,
          selector: getElementSelector(button),
          message: 'Button has zero dimensions'
        });
        return;
      }
      
      // Check if button is hidden
      if (style.display === 'none' || style.visibility === 'hidden') {
        ISSUES.brokenButtons.push({
          type: 'hidden',
          element: button,
          selector: getElementSelector(button),
          message: 'Button is hidden'
        });
        return;
      }
      
      // Check if button text is readable
      const text = button.textContent || button.innerText;
      if (!text || text.trim() === '') {
        ISSUES.brokenButtons.push({
          type: 'no-text',
          element: button,
          selector: getElementSelector(button),
          message: 'Button has no visible text'
        });
      }
      
      // Check if button is positioned off-screen
      if (rect.right < 0 || rect.bottom < 0 || rect.left > window.innerWidth || rect.top > window.innerHeight) {
        ISSUES.brokenButtons.push({
          type: 'off-screen',
          element: button,
          selector: getElementSelector(button),
          message: 'Button positioned off-screen'
        });
      }
    });
  }

  /**
   * Check for layout issues
   */
  function checkLayoutIssues() {
    const primaryColumn = document.querySelector('[data-testid="primaryColumn"]');
    const sidebar = document.querySelector('[data-testid="sidebarColumn"]');
    
    if (primaryColumn) {
      const rect = primaryColumn.getBoundingClientRect();
      
      // Check if primary column is properly sized
      if (rect.width < 300) {
        ISSUES.layoutIssues.push({
          type: 'narrow-column',
          element: primaryColumn,
          selector: '[data-testid="primaryColumn"]',
          message: `Primary column too narrow: ${rect.width}px`
        });
      }
      
      // Check if primary column is positioned correctly
      if (rect.left < 0) {
        ISSUES.layoutIssues.push({
          type: 'column-offset',
          element: primaryColumn,
          selector: '[data-testid="primaryColumn"]',
          message: `Primary column positioned off-screen: left=${rect.left}px`
        });
      }
    }
    
    if (sidebar) {
      const rect = sidebar.getBoundingClientRect();
      
      // Check if sidebar is properly positioned
      if (rect.left > 0 && rect.width < 200) {
        ISSUES.layoutIssues.push({
          type: 'sidebar-narrow',
          element: sidebar,
          selector: '[data-testid="sidebarColumn"]',
          message: `Sidebar too narrow: ${rect.width}px`
        });
      }
    }
  }

  /**
   * Check for CSS conflicts
   */
  function checkCSSConflicts() {
    const uxFixerElements = document.querySelectorAll('.ux-fixer-applied, .ux-fixer-compact, .ux-fixer-mono');
    
    uxFixerElements.forEach(element => {
      const style = window.getComputedStyle(element);
      
      // Check if our CSS is being overridden
      if (element.classList.contains('ux-fixer-mono')) {
        const fontFamily = style.fontFamily;
        if (!fontFamily.includes('Monaco') && !fontFamily.includes('Menlo') && !fontFamily.includes('monospace')) {
          ISSUES.cssConflicts.push({
            type: 'font-override',
            element: element,
            selector: getElementSelector(element),
            message: `Monospace font not applied: ${fontFamily}`
          });
        }
      }
      
      // Check if important styles are being overridden
      if (element.classList.contains('ux-fixer-compact')) {
        const padding = style.padding;
        if (padding !== '8px 12px') {
          ISSUES.cssConflicts.push({
            type: 'padding-override',
            element: element,
            selector: getElementSelector(element),
            message: `Compact padding not applied: ${padding}`
          });
        }
      }
    });
  }

  /**
   * Check for selector failures
   */
  function checkSelectorFailures() {
    const selectors = [
      '[data-testid="primaryColumn"]',
      '[data-testid="sidebarColumn"]',
      '[data-testid="tweet"]',
      '[data-testid="tweetText"]',
      '[data-testid="User-Name"]',
      '[data-testid="UserScreenName"]',
      '[data-testid="like"]',
      '[data-testid="retweet"]',
      '[data-testid="reply"]'
    ];
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        ISSUES.selectorFailures.push({
          type: 'missing',
          selector: selector,
          message: `No elements found for selector: ${selector}`
        });
      } else {
        log(`Found ${elements.length} elements for ${selector}`);
      }
    });
  }

  /**
   * Update debug panel with current issues
   */
  function updateDebugPanel() {
    const panel = document.getElementById('ux-fixer-debug-panel');
    if (!panel) return;
    
    const content = document.getElementById('debug-content');
    if (!content) return;
    
    let html = '';
    
    // Summary
    const totalIssues = Object.values(ISSUES).reduce((sum, issues) => sum + issues.length, 0);
    html += `<div style="color: ${totalIssues > 0 ? '#ff6b6b' : '#6bff6b'}; margin-bottom: 10px;">
      Issues Found: ${totalIssues}
    </div>`;
    
    // Issues by category
    Object.entries(ISSUES).forEach(([category, issues]) => {
      if (issues.length > 0) {
        html += `<div style="margin-bottom: 8px;">
          <div style="color: #ff6b6b; font-weight: bold;">${category}: ${issues.length}</div>
          ${issues.slice(0, 3).map(issue => `
            <div style="color: #ffa; font-size: 10px; margin-left: 10px;">
              ${issue.message}
            </div>
          `).join('')}
          ${issues.length > 3 ? `<div style="color: #888; font-size: 10px; margin-left: 10px;">... and ${issues.length - 3} more</div>` : ''}
        </div>`;
      }
    });
    
    if (totalIssues === 0) {
      html += '<div style="color: #6bff6b;">✅ No issues detected</div>';
    }
    
    content.innerHTML = html;
  }

  /**
   * Log summary of issues
   */
  function logSummary() {
    const totalIssues = Object.values(ISSUES).reduce((sum, issues) => sum + issues.length, 0);
    
    if (totalIssues === 0) {
      log('✅ No issues detected');
      return;
    }
    
    log(`❌ Found ${totalIssues} issues:`);
    Object.entries(ISSUES).forEach(([category, issues]) => {
      if (issues.length > 0) {
        log(`  ${category}: ${issues.length} issues`);
        issues.slice(0, 2).forEach(issue => {
          log(`    - ${issue.message}`);
        });
      }
    });
  }

  /**
   * Utility functions
   */
  function rectsOverlap(rect1, rect2) {
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
  }

  function getElementSelector(element) {
    if (element.id) return `#${element.id}`;
    if (element.getAttribute('data-testid')) return `[data-testid="${element.getAttribute('data-testid')}"]`;
    return element.tagName.toLowerCase();
  }

  function log(message, level = 'info') {
    if (level === 'debug' && DEBUG.logLevel !== 'debug') return;
    if (level === 'info' && DEBUG.logLevel === 'error') return;
    if (level === 'warn' && DEBUG.logLevel === 'error') return;
    
    const prefix = '🔍 UX Fixer Debug:';
    console.log(`${prefix} ${message}`);
  }

  // Initialize debug mode
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDebug);
  } else {
    initDebug();
  }

  // Export for manual use
  window.UXFixerDebug = {
    runChecks: runDebugChecks,
    getIssues: () => ISSUES,
    enable: () => { DEBUG.enabled = true; },
    disable: () => { DEBUG.enabled = false; }
  };

})(); 