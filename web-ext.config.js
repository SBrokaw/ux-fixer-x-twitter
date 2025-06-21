module.exports = {
  // Source directory containing the extension files
  sourceDir: '.',
  
  // Build directory for the extension
  buildDir: './web-ext-artifacts',
  
  // Files to ignore during build
  ignoreFiles: [
    'node_modules/**',
    'tests/**',
    'test-results/**',
    'coverage/**',
    '.git/**',
    '.github/**',
    'docs/**',
    'specs/**',
    'tasks/**',
    'references/**',
    '*.zip',
    '*.md',
    'package.json',
    'package-lock.json',
    'jest.config.js',
    'playwright.config.js',
    'web-ext.config.js',
    '.cursorrules',
    '.DS_Store'
  ],
  
  // Firefox preferences for testing
  firefox: 'firefox',
  
  // Firefox preferences
  firefoxPrefs: {
    'extensions.legacy.enabled': true,
    'extensions.experiments.enabled': true,
    'devtools.chrome.enabled': true,
    'devtools.debugger.remote-enabled': true,
    'devtools.debugger.prompt-connection': false,
    'extensions.webextensions.keepStorageOnUninstall': false
  },
  
  // Arguments to pass to Firefox
  firefoxArgs: [
    '--no-remote',
    '--new-instance',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding'
  ],
  
  // Start URL for testing
  startUrl: 'https://x.com/home',
  
  // Target browser
  target: 'firefox-desktop',
  
  // Artifacts directory
  artifactsDir: './web-ext-artifacts',
  
  // Should the extension be signed
  shouldSign: false,
  
  // API key for signing (if needed)
  apiKey: process.env.WEB_EXT_API_KEY,
  apiSecret: process.env.WEB_EXT_API_SECRET,
  
  // Channel for signing
  channel: 'unlisted',
  
  // Should the extension be validated
  validate: true,
  
  // Should the extension be linted
  lint: true,
  
  // Lint options
  lintOptions: {
    // Disable specific lint rules if needed
    // 'no-unsupported-browser-apis': 'off',
    // 'no-duplicate-ids': 'off'
  }
}; 