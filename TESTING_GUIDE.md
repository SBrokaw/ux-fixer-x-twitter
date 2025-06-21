# X.com UX Fixer - Testing Guide

## Quick Start Testing

### 1. Install and Test Extension
1. Open Firefox
2. Go to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select `build/manifest.json`
6. Navigate to https://x.com/home

### 2. Debug Panel
The extension now includes an automatic debug panel that appears in the top-right corner. It will:
- ✅ Show "No issues detected" if everything works
- ❌ Show specific issues if problems are found
- 🔄 Update automatically every 5 seconds
- ⌨️ Refresh manually with Ctrl+Shift+D

## Common Issues and Solutions

### Text Overlapping Issues
**Symptoms**: Text elements overlap, are invisible, or overflow containers

**Debug Panel Will Show**:
- "Text element has zero dimensions"
- "Text content overflows container"
- "Overlaps with [element]"

**Quick Fixes**:
```css
/* Add to styles/content.css */
[data-testid="tweetText"] {
  overflow: visible !important;
  white-space: normal !important;
  word-wrap: break-word !important;
}

[data-testid="User-Name"] {
  display: block !important;
  margin-bottom: 4px !important;
}
```

### Broken Buttons
**Symptoms**: Like/Retweet/Reply buttons are invisible, unclickable, or missing text

**Debug Panel Will Show**:
- "Button has zero dimensions"
- "Button is hidden"
- "Button has no visible text"
- "Button positioned off-screen"

**Quick Fixes**:
```css
/* Add to styles/content.css */
[data-testid="like"], [data-testid="retweet"], [data-testid="reply"] {
  display: inline-flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  min-width: 60px !important;
  min-height: 32px !important;
}
```

### Layout Issues
**Symptoms**: Feed is too narrow, sidebar is wrong size, elements positioned off-screen

**Debug Panel Will Show**:
- "Primary column too narrow: [width]px"
- "Primary column positioned off-screen: left=[position]px"
- "Sidebar too narrow: [width]px"

**Quick Fixes**:
```css
/* Add to styles/content.css */
[data-testid="primaryColumn"] {
  max-width: none !important;
  width: calc(100% - 200px) !important;
  margin-left: 200px !important;
}

[data-testid="sidebarColumn"] {
  width: 200px !important;
  position: fixed !important;
  left: 0 !important;
}
```

### CSS Conflicts
**Symptoms**: Our styles are being overridden by X.com's CSS

**Debug Panel Will Show**:
- "Monospace font not applied: [font-family]"
- "Compact padding not applied: [padding]"

**Quick Fixes**:
```css
/* Add to styles/content.css */
.ux-fixer-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
}

.ux-fixer-compact {
  padding: 8px 12px !important;
}
```

### Selector Failures
**Symptoms**: Extension doesn't apply to any elements

**Debug Panel Will Show**:
- "No elements found for selector: [selector]"

**Quick Fixes**:
1. Check if X.com changed their selectors
2. Update selectors in `scripts/content.js`
3. Add fallback selectors

## Manual Testing Checklist

### Visual Checks
- [ ] Feed is denser and more compact
- [ ] Text uses monospace font
- [ ] Navigation sidebar is always visible
- [ ] Action buttons have text labels
- [ ] No text overlapping
- [ ] No broken or invisible buttons
- [ ] Layout is responsive

### Functional Checks
- [ ] Like button works
- [ ] Retweet button works
- [ ] Reply button works
- [ ] Navigation links work
- [ ] Scrolling is smooth
- [ ] No console errors

### Performance Checks
- [ ] Page loads quickly
- [ ] No lag when scrolling
- [ ] No memory leaks
- [ ] Extension doesn't crash

## Console Commands for Manual Testing

Open Firefox Developer Tools (F12) and run these commands:

### Check if extension loaded
```javascript
console.log('UX Fixer loaded:', typeof window.UXFixerDebug !== 'undefined');
```

### Run debug checks manually
```javascript
if (window.UXFixerDebug) {
  window.UXFixerDebug.runChecks();
}
```

### Get all issues
```javascript
if (window.UXFixerDebug) {
  console.log('All issues:', window.UXFixerDebug.getIssues());
}
```

### Check if selectors work
```javascript
const selectors = [
  '[data-testid="primaryColumn"]',
  '[data-testid="tweet"]',
  '[data-testid="like"]'
];
selectors.forEach(selector => {
  const elements = document.querySelectorAll(selector);
  console.log(`${selector}: ${elements.length} elements found`);
});
```

### Test CSS injection
```javascript
const style = document.createElement('style');
style.textContent = 'body { background: red !important; }';
document.head.appendChild(style);
// If background turns red, CSS injection works
```

## Troubleshooting Steps

### 1. Extension Not Loading
- Check Firefox console for errors
- Verify manifest.json is valid
- Try reloading the extension
- Check if CSP is blocking the extension

### 2. Styles Not Applying
- Check if CSS file is being injected
- Look for CSS conflicts in DevTools
- Verify selectors are correct
- Check if X.com changed their structure

### 3. JavaScript Errors
- Check console for error messages
- Verify content script is running
- Check for syntax errors in content.js
- Look for conflicts with X.com's JavaScript

### 4. Performance Issues
- Check for infinite loops in content script
- Look for memory leaks
- Verify observers are properly cleaned up
- Check if too many DOM manipulations

## Reporting Issues

When reporting issues, include:

1. **Debug Panel Output**: Screenshot or text of what the debug panel shows
2. **Console Errors**: Any error messages from Firefox console
3. **Steps to Reproduce**: Exact steps to trigger the issue
4. **Expected vs Actual**: What should happen vs what actually happens
5. **Browser Version**: Firefox version and OS
6. **X.com Changes**: Any recent changes to X.com that might affect the extension

## Quick Fix Workflow

1. **Load extension** and navigate to X.com
2. **Check debug panel** for immediate issues
3. **Open DevTools** and check console for errors
4. **Apply quick fixes** from the CSS examples above
5. **Test functionality** using the checklist
6. **Report issues** with debug panel output

This automated debugging system should catch most issues automatically and provide specific guidance for fixing them. 