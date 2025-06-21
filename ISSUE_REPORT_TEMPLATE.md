# Issue Report Template

## Issue Description
[Brief description of what's not working]

## Debug Panel Output
```
[Copy the exact text from the debug panel in the top-right corner]
```

## Console Errors
```
[Copy any error messages from Firefox Developer Tools Console]
```

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Screenshots
[If applicable, describe what you see]

## Environment
- Firefox Version: [version]
- OS: [operating system]
- Extension Version: [from manifest.json]
- X.com URL: [exact URL where issue occurs]

## Additional Information
[Any other relevant details]

---

## Quick Debug Commands
Run these in Firefox Console (F12) and include the output:

```javascript
// Check if extension loaded
console.log('UX Fixer loaded:', typeof window.UXFixerDebug !== 'undefined');

// Get all issues
if (window.UXFixerDebug) {
  console.log('All issues:', window.UXFixerDebug.getIssues());
}

// Check selectors
const selectors = ['[data-testid="primaryColumn"]', '[data-testid="tweet"]', '[data-testid="like"]'];
selectors.forEach(selector => {
  const elements = document.querySelectorAll(selector);
  console.log(`${selector}: ${elements.length} elements found`);
});
``` 