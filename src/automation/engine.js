const { chromium } = require('playwright');

async function runDemoQuote() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext({
    viewport: {
      width: 1440,
      height: 900
    }
  });

  const page = await context.newPage();

  await page.goto('https://demoqa.com/automation-practice-form', {
    waitUntil: 'domcontentloaded'
  });

  await page.fill('#firstName', 'Josh');
  await page.fill('#lastName', 'Morrison');
  await page.fill('#userEmail', 'demo@policygpt.com');
  await page.click('label[for="gender-radio-1"]');
  await page.fill('#userNumber', '5551234567');
  await page.fill('#currentAddress', '123 Demo Street, Miami, FL');

  await page.waitForTimeout(8000);
}

module.exports = {
  runDemoQuote
};
