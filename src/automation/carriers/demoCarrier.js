async function runDemoCarrier({ page, quote }) {
  await page.goto('https://demoqa.com/automation-practice-form', {
    waitUntil: 'domcontentloaded'
  });

  await page.fill('#firstName', quote.customer.firstName);
  await page.fill('#lastName', quote.customer.lastName);
  await page.fill('#userEmail', quote.customer.email);
  await page.click('label[for="gender-radio-1"]');
  await page.fill('#userNumber', quote.customer.phone);
  await page.fill('#currentAddress', '123 Demo Street, Miami, FL');

  await page.waitForTimeout(5000);

  return {
    carrier: 'Demo Carrier',
    status: 'completed',
    result: 'Demo quote form completed successfully.'
  };
}

module.exports = { runDemoCarrier };
