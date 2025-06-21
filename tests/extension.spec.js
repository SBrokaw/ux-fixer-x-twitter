const { test, expect } = require('@playwright/test');

test.describe('X.com UX Fixer Extension', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to X.com home page
    await page.goto('/home');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should load extension and apply transformations', async ({ page }) => {
    // Check if extension is loaded by looking for debug panel
    const debugPanel = page.locator('#ux-fixer-debug-panel');
    await expect(debugPanel).toBeVisible();
    
    // Check if extension status is displayed
    const extensionStatus = page.locator('#ux-fixer-status');
    await expect(extensionStatus).toBeVisible();
    await expect(extensionStatus).toContainText('Extension Active');
  });

  test('should apply compact styling to tweets', async ({ page }) => {
    // Wait for tweets to load
    await page.waitForSelector('[data-testid="tweet"]', { timeout: 10000 });
    
    // Check if tweets have the compact styling applied
    const tweets = page.locator('[data-testid="tweet"]');
    const firstTweet = tweets.first();
    
    // Verify compact styling is applied
    await expect(firstTweet).toHaveClass(/ux-fixer-compact/);
    
    // Check if padding is reduced
    const tweetPadding = await firstTweet.evaluate(el => 
      window.getComputedStyle(el).padding
    );
    expect(tweetPadding).toBe('8px');
  });

  test('should transform buttons with proper labels', async ({ page }) => {
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
    await expect(firstButton).toHaveClass(/ux-fixer-button/);
    
    // Check for button label element
    const buttonLabel = firstButton.locator('.ux-fixer-button-label');
    await expect(buttonLabel).toBeVisible();
  });

  test('should handle text overflow properly', async ({ page }) => {
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

  test('should maintain functionality while applying transformations', async ({ page }) => {
    // Wait for interactive elements to load
    await page.waitForSelector('[data-testid="tweet"]', { timeout: 10000 });
    
    // Check if tweets are still clickable
    const tweets = page.locator('[data-testid="tweet"]');
    const firstTweet = tweets.first();
    
    // Verify tweet is still interactive
    await expect(firstTweet).toBeVisible();
    await expect(firstTweet).toBeEnabled();
    
    // Check if buttons are still functional
    const buttons = page.locator('button');
    const firstButton = buttons.first();
    await expect(firstButton).toBeEnabled();
  });

  test('should handle dynamic content loading', async ({ page }) => {
    // Scroll down to trigger dynamic content loading
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Wait for new content to load
    await page.waitForTimeout(2000);
    
    // Check if new tweets also have transformations applied
    const tweets = page.locator('[data-testid="tweet"]');
    const tweetCount = await tweets.count();
    
    if (tweetCount > 0) {
      const lastTweet = tweets.last();
      await expect(lastTweet).toHaveClass(/ux-fixer-compact/);
    }
  });

  test('should display debug information correctly', async ({ page }) => {
    // Check if debug panel shows issue count
    const issueCount = page.locator('#ux-fixer-issue-count');
    await expect(issueCount).toBeVisible();
    
    // Check if issue count is a number
    const countText = await issueCount.textContent();
    const count = parseInt(countText);
    expect(count).toBeGreaterThanOrEqual(0);
    
    // Check if debug panel shows transformation stats
    const transformationStats = page.locator('#ux-fixer-stats');
    await expect(transformationStats).toBeVisible();
  });
}); 