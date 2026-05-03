const tabs = document.querySelectorAll('.pgpt-tab');
const panels = document.querySelectorAll('.pgpt-tab-panel');

const runDemoBtn = document.getElementById('runDemoBtn');
const statusText = document.getElementById('statusText');

const lineOfBusinessSelect = document.getElementById('lineOfBusiness');
const matchingCarriersList = document.getElementById('matchingCarriersList');
const carrierRegistryList = document.getElementById('carrierRegistryList');

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

function formatLine(line) {
  return line
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function renderMatchingCarriers(carriers) {
  if (!carriers.length) {
    matchingCarriersList.innerHTML = '<div>No enabled carriers match this line yet.</div>';
    return;
  }

  matchingCarriersList.innerHTML = carriers
    .map((carrier) => {
      return `
        <div class="pgpt-mini-item">
          <strong>${carrier.name}</strong>
          <span>${carrier.mode}</span>
        </div>
      `;
    })
    .join('');
}

function renderCarrierRegistry(carriers) {
  const entries = Object.entries(carriers);

  carrierRegistryList.innerHTML = entries
    .map(([key, carrier]) => {
      const lines = carrier.lines.map(formatLine).join(', ');
      const status = carrier.enabled ? 'Enabled' : 'Disabled';

      return `
        <article class="pgpt-carrier-row">
          <div>
            <h3>${carrier.name}</h3>
            <p><strong>Key:</strong> ${key}</p>
            <p><strong>Lines:</strong> ${lines}</p>
            <p><strong>Mode:</strong> ${carrier.mode}</p>
          </div>
          <div class="pgpt-carrier-meta">
            <span>${status}</span>
            <small>${carrier.loginUrl || 'Login URL not set'}</small>
          </div>
        </article>
      `;
    })
    .join('');
}

async function refreshCarrierViews() {
  const selectedLine = lineOfBusinessSelect.value;
  const allCarriers = await window.policygptRater.getAllCarriers();
  const matchingCarriers = await window.policygptRater.getCarriersForLine(selectedLine);

  renderCarrierRegistry(allCarriers);
  renderMatchingCarriers(matchingCarriers);
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

lineOfBusinessSelect.addEventListener('change', refreshCarrierViews);

runDemoBtn.addEventListener('click', async () => {
  runDemoBtn.disabled = true;

  const lineOfBusiness = lineOfBusinessSelect.value;
  setStatus(`Running demo automation for ${formatLine(lineOfBusiness)}...`);

  const result = await window.policygptRater.runDemoQuote(lineOfBusiness);

  setStatus(result.message);
  await refreshCarrierViews();

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

refreshCarrierViews();
