const runDemoBtn = document.getElementById('runDemoBtn');
const statusText = document.getElementById('statusText');

runDemoBtn.addEventListener('click', async () => {
  runDemoBtn.disabled = true;
  statusText.textContent = 'Running demo automation...';

  const result = await window.policygptRater.runDemoQuote();

  statusText.textContent = result.message;
  runDemoBtn.disabled = false;
});
