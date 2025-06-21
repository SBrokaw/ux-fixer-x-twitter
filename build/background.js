/**
 * X.com UX Fixer - Background Script
 * Handles extension initialization and CSP management
 */

// Listen for extension installation
browser.runtime.onInstalled.addListener((details) => {
  console.log('X.com UX Fixer installed:', details.reason);
});

// Listen for tab updates to inject content scripts
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && 
      (tab.url && (tab.url.includes('x.com') || tab.url.includes('twitter.com')))) {
    
    console.log('Injecting UX Fixer into:', tab.url);
    
    // Inject content scripts
    browser.scripting.executeScript({
      target: { tabId: tabId },
      files: ['scripts/debug.js', 'scripts/content.js']
    }).catch(error => {
      console.error('Failed to inject content scripts:', error);
    });
    
    // Inject CSS
    browser.scripting.insertCSS({
      target: { tabId: tabId },
      files: ['styles/content.css']
    }).catch(error => {
      console.error('Failed to inject CSS:', error);
    });
  }
});

// Handle messages from content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  if (message.type === 'DEBUG_INFO') {
    console.log('Debug info from content script:', message.data);
  }
  
  sendResponse({ status: 'received' });
});

// Extension icon click handler
browser.action.onClicked.addListener((tab) => {
  if (tab.url && (tab.url.includes('x.com') || tab.url.includes('twitter.com'))) {
    // Toggle extension on the current tab
    browser.tabs.sendMessage(tab.id, { type: 'TOGGLE_EXTENSION' });
  }
});

console.log('X.com UX Fixer background script loaded'); 