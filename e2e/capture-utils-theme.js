/**
 * Extended utilities for theme-specific visual captures
 * Provides additional utilities for toggling between light and dark themes
 */
const { 
  resolveOutDir,
  computeTag,
  ensureDir,
  dismissOnboarding,
  takeFullPageScreenshot,
  takeElementScreenshot,
  logCapture
} = require('./capture-utils');

/**
 * Set up the theme state for screenshots
 * @param {import('@playwright/test').Page} page Playwright page
 * @param {string} state The desired theme state ('darkTheme' or 'lightTheme')
 */
async function setupThemeState(page, state) {
  try {
    if (state === 'lightTheme') {
      // Set light mode via localStorage
      await page.evaluate(() => {
        localStorage.setItem('betmate.theme', 'light');
        document.documentElement.classList.remove('dark-mode');
        document.documentElement.classList.add('light-mode');
      });
      logCapture('Set light theme for capture', 'info');
    } else if (state === 'darkTheme') {
      // Set dark mode via localStorage
      await page.evaluate(() => {
        localStorage.setItem('betmate.theme', 'dark');
        document.documentElement.classList.remove('light-mode');
        document.documentElement.classList.add('dark-mode');
      });
      logCapture('Set dark theme for capture', 'info');
    }
    // Wait for transitions to complete
    await page.waitForTimeout(300);
  } catch (error) {
    logCapture(`Error setting theme state: ${error.message}`, 'error');
  }
}

module.exports = {
  resolveOutDir,
  computeTag,
  ensureDir,
  dismissOnboarding,
  takeFullPageScreenshot,
  takeElementScreenshot,
  logCapture,
  setupThemeState
};