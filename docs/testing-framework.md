# Automated Testing Framework

This document describes the comprehensive automated testing framework for the X.com UX Fixer Firefox extension.

## Overview

The testing framework integrates multiple testing tools to ensure the extension works correctly across different environments:

- **web-ext**: Official Mozilla CLI tool for Firefox extension testing
- **Playwright**: Headless browser testing for integration tests
- **Jest**: Unit testing for JavaScript modules
- **GitHub Actions**: CI/CD pipeline for automated testing

## Quick Start

### Prerequisites

1. **Node.js 18+** and npm
2. **Firefox** browser installed
3. **Git** for version control

### Installation

```bash
# Install dependencies
npm install

# Install web-ext globally
npm run install:web-ext

# Install Playwright browsers
npm run install:playwright
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test types
npm run test:lint      # Extension linting
npm run test:unit      # Unit tests
npm run test:integration # Integration tests

# Test extension in Firefox
npm run test:extension

# Development with auto-reload
npm run dev
```

## Test Structure

### 1. Unit Tests (`tests/content-script.test.js`)

Unit tests focus on individual functions and components:

- **DOM Transformation**: Testing CSS class application and element manipulation
- **Debug Panel**: Verifying debug panel creation and functionality
- **Error Handling**: Ensuring graceful handling of edge cases
- **CSS Management**: Testing class addition/removal logic

**Example:**
```javascript
test('should apply compact styling to tweets', () => {
  const tweet = document.querySelector('[data-testid="tweet"]');
  tweet.classList.add('ux-fixer-compact');
  expect(tweet).toHaveClass('ux-fixer-compact');
});
```

### 2. Integration Tests (`tests/extension.spec.js`)

Integration tests verify the extension works end-to-end:

- **Extension Loading**: Verifies extension loads and applies transformations
- **UI Transformations**: Tests compact styling, button transformations, text overflow
- **Functionality Preservation**: Ensures core X.com functionality remains intact
- **Dynamic Content**: Tests handling of dynamically loaded content
- **Debug Information**: Verifies debug panel displays correct information

**Example:**
```javascript
test('should load extension and apply transformations', async ({ page }) => {
  const debugPanel = page.locator('#ux-fixer-debug-panel');
  await expect(debugPanel).toBeVisible();
  await expect(debugPanel).toContainText('Extension Active');
});
```

### 3. Extension Testing (`web-ext`)

web-ext provides Firefox-specific testing capabilities:

- **Extension Loading**: Tests extension in actual Firefox environment
- **CSP Compliance**: Verifies Content Security Policy compatibility
- **Manifest Validation**: Ensures manifest.json is valid
- **Cross-version Testing**: Tests with different Firefox versions

## Configuration Files

### package.json

Defines npm scripts and dependencies:

```json
{
  "scripts": {
    "test": "npm run test:lint && npm run test:unit && npm run test:integration",
    "test:lint": "web-ext lint",
    "test:unit": "jest",
    "test:integration": "playwright test",
    "test:extension": "web-ext run --firefox=firefox --verbose",
    "dev": "web-ext run --firefox=firefox --watch"
  }
}
```

### playwright.config.js

Configures Playwright for integration testing:

- **Browser Configuration**: Firefox and Firefox Nightly
- **Test Environment**: X.com as base URL
- **Reporting**: HTML, JSON, and Markdown reports
- **CI Settings**: Retry logic and parallel execution

### jest.config.js

Configures Jest for unit testing:

- **Test Environment**: jsdom for DOM simulation
- **Coverage**: Code coverage reporting
- **Mocking**: Browser API mocks
- **Reporting**: JUnit XML output for CI

### web-ext.config.js

Configures web-ext for extension testing:

- **Build Settings**: Source and output directories
- **Firefox Preferences**: Testing-specific browser settings
- **Validation**: Linting and manifest validation
- **Signing**: Optional extension signing configuration

## CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/test.yml`)

The CI pipeline runs on every push and pull request:

1. **Matrix Testing**: Tests across Node.js 18.x and 20.x
2. **Firefox Versions**: Tests with Firefox and Firefox Nightly
3. **Test Types**: Runs linting, unit tests, and integration tests
4. **Extension Testing**: Tests the built extension with web-ext
5. **Reporting**: Generates comprehensive test reports

### Workflow Jobs

1. **test**: Runs all automated tests
2. **test-extension**: Tests extension in actual Firefox
3. **report**: Generates and uploads test reports

## Development Workflow

### Local Development

```bash
# Start development with auto-reload
npm run dev

# Run tests during development
npm test

# Test specific functionality
npm run test:unit -- --watch
```

### Debugging

1. **Extension Debugging**: Use `npm run test:extension` for interactive testing
2. **Test Debugging**: Use `--debug` flag with Playwright tests
3. **Console Output**: Check test results in `test-results/` directory

### Common Commands

```bash
# Build extension
npm run build:extension

# Test extension in different Firefox versions
npm run test:extension:nightly

# Run tests in CI mode
npm run ci:test

# Generate coverage report
npm run test:unit -- --coverage
```

## Test Data and Fixtures

### Mock Data

Tests use mock DOM structures that simulate X.com:

```javascript
document.body.innerHTML = `
  <div id="react-root">
    <div data-testid="tweet">
      <div data-testid="tweetText">Test tweet content</div>
      <button aria-label="Reply">Reply</button>
    </div>
  </div>
`;
```

### Browser Mocks

Jest setup mocks browser APIs:

```javascript
global.browser = {
  runtime: { sendMessage: jest.fn() },
  tabs: { query: jest.fn() },
  storage: { local: { get: jest.fn() } }
};
```

## Reporting and Monitoring

### Test Reports

- **HTML Reports**: Interactive test reports in `playwright-report/`
- **JSON Reports**: Machine-readable results in `test-results/results.json`
- **Markdown Reports**: Human-readable summaries in `test-results/results.md`
- **Coverage Reports**: Code coverage in `coverage/`

### CI Artifacts

GitHub Actions uploads:
- Test results and reports
- Extension builds
- Coverage data
- Screenshots and videos (on failure)

## Troubleshooting

### Common Issues

1. **Firefox Not Found**: Ensure Firefox is installed and in PATH
2. **Extension Not Loading**: Check manifest.json and CSP settings
3. **Test Timeouts**: Increase timeout values for slow operations
4. **Selector Failures**: Update selectors to match current X.com DOM

### Debug Commands

```bash
# Debug extension loading
web-ext run --firefox=firefox --verbose

# Debug test failures
npm run test:integration -- --debug

# Check extension linting
web-ext lint --verbose
```

## Future Enhancements

1. **Visual Regression Testing**: Add screenshot comparison tests
2. **Performance Testing**: Measure extension performance impact
3. **Accessibility Testing**: Add a11y compliance tests
4. **Cross-browser Testing**: Extend to other browsers if needed
5. **E2E User Flows**: Add complete user journey tests

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Add appropriate documentation
3. Ensure tests pass in CI
4. Update this documentation if needed
5. Consider test performance impact

For questions or issues with the testing framework, please refer to the project's issue tracker. 