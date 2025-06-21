# Troubleshooting Guide - Extension Not Working

## Problem: Extension loads but page looks unmodified and no debug panel

### Step 1: Check Extension Installation
1. Go to `about:debugging` in Firefox
2. Click "This Firefox"
3. Look for "X.com UX Fixer" in the list
4. Check if there are any error messages in red

### Step 2: Check Console for Errors
1. Open Firefox Developer Tools (F12)
2. Go to Console tab
3. Navigate to https://x.com/home
4. Look for any error messages, especially:
   - CSP (Content Security Policy) violations
   - JavaScript errors
   - Missing file errors

### Step 3: Verify Content Script Loading
In the Console, run these commands:

```javascript
// Check if extension loaded
console.log('Extension loaded:', typeof window.UXFixerDebug !== 'undefined');

// Check if debug panel exists
console.log('Debug panel exists:', document.getElementById('ux-fixer-debug-panel') !== null);

// Check if CSS is applied
const style = document.querySelector('link[href*="content.css"]');
console.log('CSS loaded:', style !== null);

// Check for our classes
const elements = document.querySelectorAll('.ux-fixer-applied');
console.log('UX Fixer elements found:', elements.length);
```

### Step 4: Check File Paths
The manifest.json should reference files correctly:
- `"css": ["content.css"]` (not `"styles/content.css"`)
- `"js": ["debug.js", "content.js"]` (not `"scripts/debug.js"`)

### Step 5: Test CSS Injection Manually
In the Console, run:

```javascript
// Test if we can inject CSS
const testStyle = document.createElement('style');
testStyle.textContent = 'body { background: red !important; }';
document.head.appendChild(testStyle);
// If background turns red, CSS injection works
```

### Step 6: Check X.com Selectors
In the Console, run:

```javascript
// Check if X.com selectors exist
const selectors = [
  '[data-testid="primaryColumn"]',
  '[data-testid="tweet"]',
  '[data-testid="like"]',
  '[data-testid="retweet"]',
  '[data-testid="reply"]'
];

selectors.forEach(selector => {
  const elements = document.querySelectorAll(selector);
  console.log(`${selector}: ${elements.length} elements found`);
});
```

## Common Issues and Solutions

### Issue 1: Extension not loading
**Symptoms**: No extension appears in about:debugging
**Solution**: 
- Check manifest.json syntax
- Remove and reload the extension
- Try a different manifest.json file

### Issue 2: Content Security Policy blocking
**Symptoms**: CSP errors in console
**Solution**:
- This means X.com blocks modifications
- Project may be unfeasible
- Document in technical feasibility tasks

### Issue 3: Selectors not found
**Symptoms**: "0 elements found" for all selectors
**Solution**:
- X.com may have changed their DOM structure
- Update selectors in content.js
- Check if page is fully loaded

### Issue 4: CSS not applying
**Symptoms**: No visual changes, CSS file not loaded
**Solution**:
- Check file paths in manifest.json
- Verify CSS file exists in build directory
- Test manual CSS injection

### Issue 5: JavaScript errors
**Symptoms**: Console shows JavaScript errors
**Solution**:
- Check for syntax errors in content.js or debug.js
- Verify all functions are defined
- Check for conflicts with X.com's JavaScript

## Quick Fix Commands

If the extension is loaded but not working, try these in the Console:

```javascript
// Force reload the extension
window.location.reload();

// Manually trigger debug panel
if (window.UXFixerDebug) {
  window.UXFixerDebug.runChecks();
}

// Manually apply some CSS
const style = document.createElement('style');
style.textContent = `
  [data-testid="primaryColumn"] {
    background: yellow !important;
  }
`;
document.head.appendChild(style);
```

## Next Steps

1. **Run the troubleshooting steps above**
2. **Report findings** using the issue report template
3. **Include console output** in your report
4. **Check if it's a technical feasibility issue**

If none of these steps work, the issue may be:
- X.com has strict CSP that blocks modifications
- X.com changed their DOM structure
- Firefox extension permissions issue
- Technical feasibility problem

Report your findings and we can determine the next steps! 