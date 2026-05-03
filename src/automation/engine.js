const { chromium } = require('playwright');
const sampleQuote = require('../shared/sample-quote-request.json');
const { runDemoCarrier } = require('./carriers/demoCarrier');

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

  const result = await runDemoCarrier({
    page,
    quote: sampleQuote
  });

  await page.waitForTimeout(3000);

  return result;
}

module.exports = {
  runDemoQuote
};
