const tabs = document.querySelectorAll('.pgpt-tab');
const panels = document.querySelectorAll('.pgpt-tab-panel');

const runDemoBtn = document.getElementById('runDemoBtn');
const statusText = document.getElementById('statusText');

const carrierKeyInput = document.getElementById('carrierKey');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

const saveBtn = document.getElementById('saveCreds');
const loadBtn = document.getElementById('loadCreds');
const deleteBtn = document.getElementById('deleteCreds');

function setStatus(message) {
  statusText.textContent = message;
}

function getCarrierKey() {
  return (carrierKeyInput.value || '').trim().toLowerCase();
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    tabs.forEach((item) => item.classList.remove('active'));
    panels.forEach((panel) => panel.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(target).classList.add('active');
  });
});

runDemoBtn.addEventListener('click', async () => {
  runDemoBtn.disabled = true;
  setStatus('Running demo automation...');

  const result = await window.policygptRater.runDemoQuote();

  setStatus(result.message);
  runDemoBtn.disabled = false;
});

saveBtn.addEventListener('click', async () => {
  const carrierKey = getCarrierKey();

  if (!carrierKey) {
    setStatus('Please enter a carrier key.');
    return;
  }

  await window.policygptRater.saveCredential(
    `${carrierKey}.username`,
    usernameInput.value
  );

  await window.policygptRater.saveCredential(
    `${carrierKey}.password`,
    passwordInput.value
  );

  setStatus(`Credentials saved securely for ${carrierKey}.`);
});

loadBtn.addEventListener('click', async () => {
  const carrierKey = getCarrierKey();

  if (!carrierKey) {
    setStatus('Please enter a carrier key.');
    return;
  }

  const username = await window.policygptRater.getCredential(`${carrierKey}.username`);
  const password = await window.policygptRater.getCredential(`${carrierKey}.password`);

  usernameInput.value = username || '';
  passwordInput.value = password || '';

  setStatus(`Credentials loaded for ${carrierKey}.`);
});

deleteBtn.addEventListener('click', async () => {
  const carrierKey = getCarrierKey();

  if (!carrierKey) {
    setStatus('Please enter a carrier key.');
    return;
  }

  await window.policygptRater.deleteCredential(`${carrierKey}.username`);
  await window.policygptRater.deleteCredential(`${carrierKey}.password`);

  usernameInput.value = '';
  passwordInput.value = '';

  setStatus(`Credentials deleted for ${carrierKey}.`);
});
