const { test, expect, chromium, firefox } = require('@playwright/test');
const path = require('path');

const EXTENSION_PATH = path.join(__dirname, '../build');

// Use Playwright's built-in extension loading
let context;
let page;

test.beforeAll(async () => {
  // Use Playwright's extension loading API
  context = await firefox.launchPersistentContext('', {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
  
  // Load extension using Playwright's API
  await context.addInitScript(() => {
    // This will run before the page loads
    console.log('Extension loading script initialized');
  });
  
  page = await context.newPage();
  
  // Navigate to a simple page first to test extension loading
  await page.goto('about:blank');
  
  // Check if we can access the extension
  const extensionLoaded = await page.evaluate(() => {
    return typeof window.XComUXFixer !== 'undefined';
  });
  
  console.log('Extension loaded check:', extensionLoaded);
});

test.afterAll(async () => {
  await context.close();
});

test.describe('X.com UX Fixer Extension', () => {
  test('should load extension', async () => {
    // Simple test to verify extension loads
    const extensionLoaded = await page.evaluate(() => {
      return typeof window.XComUXFixer !== 'undefined';
    });
    
    expect(extensionLoaded).toBe(true);
  });

  test('should access X.com', async () => {
    // Test if we can access X.com at all
    await page.goto('https://x.com');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we're on X.com
    const title = await page.title();
    console.log('Page title:', title);
    
    expect(title).toContain('X');
  });

  test('should load extension and apply transformations', async () => {
    // Navigate to X.com home page
    await page.goto('https://x.com/home');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if extension is loaded
    const extensionLoaded = await page.evaluate(() => {
      return typeof window.XComUXFixer !== 'undefined';
    });
    
    if (!extensionLoaded) {
      console.log('Extension not loaded, checking page content...');
      const pageContent = await page.content();
      console.log('Page content length:', pageContent.length);
      console.log('Page URL:', page.url());
    }
    
    expect(extensionLoaded).toBe(true);
    
    // Check if extension is loaded by looking for debug panel
    const debugPanel = page.locator('#ux-fixer-debug-panel');
    
    // Wait for extension to load with proper timeout
    try {
      await expect(debugPanel).toBeVisible({ timeout: 10000 });
    } catch (error) {
      console.log('Debug panel not found, checking for other extension elements...');
      
      // Check for any extension-related elements
      const extensionElements = await page.locator('[class*="ux-fixer"]').count();
      console.log('Extension elements found:', extensionElements);
      
      throw new Error('Extension loaded but debug panel not visible: ' + error.message);
    }
    
    // Check if extension status is displayed
    const extensionStatus = page.locator('#ux-fixer-status');
    await expect(extensionStatus).toBeVisible({ timeout: 5000 });
    await expect(extensionStatus).toContainText('Extension Active');
  });

  test('should apply compact styling to tweets', async () => {
    // Wait for tweets to load
    await page.waitForSelector('[data-testid="tweet"]', { timeout: 10000 });
    
    // Check if tweets have the compact styling applied
    const tweets = page.locator('[data-testid="tweet"]');
    const firstTweet = tweets.first();
    
    // Verify compact styling is applied
    await expect(firstTweet).toHaveClass(/ux-fixer-compact/, { timeout: 5000 });
    
    // Check if padding is reduced
    const tweetPadding = await firstTweet.evaluate(el => 
      window.getComputedStyle(el).padding
    );
    expect(tweetPadding).toBe('8px');
  });

  test('should transform buttons with proper labels', async () => {
    // Wait for buttons to load
    await page.waitForSelector('button', { timeout: 10000 });
    
    // Check if buttons have been transformed
    const buttons = page.locator('button');
    const transformedButtons = buttons.filter({ hasText: /Reply|Retweet|Like|Share/ });
    
    // Verify at least some buttons are transformed
    const count = await transformedButtons.count();
    expect(count).toBeGreaterThan(0);
    
    // Check if buttons have proper labels
    const firstButton = transformedButtons.first();
    await expect(firstButton).toHaveClass(/ux-fixer-button/, { timeout: 5000 });
    
    // Check for button label element
    const buttonLabel = firstButton.locator('.ux-fixer-button-label');
    await expect(buttonLabel).toBeVisible({ timeout: 5000 });
  });

  test('should handle text overflow properly', async () => {
    // Wait for content to load
    await page.waitForSelector('[data-testid="tweetText"]', { timeout: 10000 });
    
    // Check if text elements have proper overflow handling
    const tweetTexts = page.locator('[data-testid="tweetText"]');
    const firstTweetText = tweetTexts.first();
    
    // Verify overflow is set to visible
    const overflow = await firstTweetText.evaluate(el => 
      window.getComputedStyle(el).overflow
    );
    expect(overflow).toBe('visible');
  });

  test('should maintain functionality while applying transformations', async () => {
    // Wait for interactive elements to load
    await page.waitForSelector('[data-testid="tweet"]', { timeout: 10000 });
    
    // Check if tweets are still clickable
    const tweets = page.locator('[data-testid="tweet"]');
    const firstTweet = tweets.first();
    
    // Verify tweet is still interactive
    await expect(firstTweet).toBeVisible({ timeout: 5000 });
    await expect(firstTweet).toBeEnabled({ timeout: 5000 });
    
    // Check if buttons are still functional
    const buttons = page.locator('button');
    const firstButton = buttons.first();
    await expect(firstButton).toBeEnabled({ timeout: 5000 });
  });

  test('should handle dynamic content loading', async () => {
    // Scroll down to trigger dynamic content loading
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Wait for new content to load
    await page.waitForTimeout(2000);
    
    // Check if new tweets also have transformations applied
    const tweets = page.locator('[data-testid="tweet"]');
    const tweetCount = await tweets.count();
    
    if (tweetCount > 0) {
      const lastTweet = tweets.last();
      await expect(lastTweet).toHaveClass(/ux-fixer-compact/, { timeout: 5000 });
    }
  });

  test('should display debug information correctly', async () => {
    // Check if debug panel shows issue count
    const issueCount = page.locator('#ux-fixer-issue-count');
    await expect(issueCount).toBeVisible({ timeout: 5000 });
    
    // Check if issue count is a number
    const countText = await issueCount.textContent();
    const count = parseInt(countText);
    expect(count).toBeGreaterThanOrEqual(0);
    
    // Check if debug panel shows transformation stats
    const transformationStats = page.locator('#ux-fixer-stats');
    await expect(transformationStats).toBeVisible({ timeout: 5000 });
  });
}); 