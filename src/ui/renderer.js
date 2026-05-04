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

const newCarrierNameInput = document.getElementById('newCarrierName');
const newCarrierKeyInput = document.getElementById('newCarrierKey');
const newCarrierLoginUrlInput = document.getElementById('newCarrierLoginUrl');
const newCarrierQuoteUrlInput = document.getElementById('newCarrierQuoteUrl');
const newCarrierModeInput = document.getElementById('newCarrierMode');
const newCarrierEnabledInput = document.getElementById('newCarrierEnabled');
const newCarrierUsernameInput = document.getElementById('newCarrierUsername');
const newCarrierPasswordInput = document.getElementById('newCarrierPassword');
const saveCarrierBtn = document.getElementById('saveCarrierBtn');

function setStatus(message) {
  statusText.textContent = message;
}

function getCarrierKey() {
  return (carrierKeyInput.value || '').trim().toLowerCase();
}

function makeCarrierKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function formatLine(line) {
  return line
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getSelectedNewCarrierLines() {
  return Array.from(document.querySelectorAll('.newCarrierLine:checked'))
    .map((input) => input.value);
}

function getLineWorkflows(lines) {
  const workflows = {};

  lines.forEach((line) => {
    const input = document.querySelector(`.lineQuoteUrl[data-line="${line}"]`);

    workflows[line] = {
      quoteUrl: input ? input.value.trim() : '',
      mode: newCarrierModeInput.value
    };
  });

  return workflows;
}

function clearNewCarrierForm() {
  newCarrierNameInput.value = '';
  newCarrierKeyInput.value = '';
  newCarrierLoginUrlInput.value = '';
  newCarrierQuoteUrlInput.value = '';
  newCarrierModeInput.value = 'realtime';
  newCarrierEnabledInput.checked = true;
  newCarrierUsernameInput.value = '';
  newCarrierPasswordInput.value = '';

  document.querySelectorAll('.newCarrierLine').forEach((input) => {
    input.checked = false;
  });

  document.querySelectorAll('.lineQuoteUrl').forEach((input) => {
    input.value = '';
  });
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
          <span>${carrier.activeMode}</span>
          <small>${carrier.activeQuoteUrl || 'No quote URL set'}</small>
        </div>
      `;
    })
    .join('');
}

function renderCarrierRegistry(carriers) {
  const entries = Object.entries(carriers);

  if (!entries.length) {
    carrierRegistryList.innerHTML = '<p>No carriers added yet.</p>';
    return;
  }

  carrierRegistryList.innerHTML = entries
    .map(([key, carrier]) => {
      const lines = Array.isArray(carrier.lines) ? carrier.lines.map(formatLine).join(', ') : '';
      const status = carrier.enabled ? 'Enabled' : 'Disabled';

      const workflowRows = Object.entries(carrier.lineWorkflows || {})
        .map(([line, workflow]) => {
          return `
            <div class="pgpt-workflow-row">
              <strong>${formatLine(line)}</strong>
              <span>${workflow.mode || carrier.mode}</span>
              <small>${workflow.quoteUrl || carrier.quoteUrl || 'No quote URL set'}</small>
            </div>
          `;
        })
        .join('');

      return `
        <article class="pgpt-carrier-row">
          <div>
            <h3>${carrier.name}</h3>
            <p><strong>Key:</strong> ${key}</p>
            <p><strong>Lines:</strong> ${lines || 'No lines selected'}</p>
            <p><strong>Login URL:</strong> ${carrier.loginUrl || 'Not set'}</p>
            <div class="pgpt-workflow-list">
              ${workflowRows || '<small>No line workflows set.</small>'}
            </div>
          </div>
          <div class="pgpt-carrier-meta">
            <span>${status}</span>
            <small>${carrier.mode || 'realtime'}</small>
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

newCarrierNameInput.addEventListener('input', () => {
  if (!newCarrierKeyInput.value.trim()) {
    newCarrierKeyInput.value = makeCarrierKey(newCarrierNameInput.value);
  }
});

saveCarrierBtn.addEventListener('click', async () => {
  const name = newCarrierNameInput.value.trim();
  const key = makeCarrierKey(newCarrierKeyInput.value || name);
  const lines = getSelectedNewCarrierLines();

  if (!name || !key) {
    setStatus('Carrier name and carrier key are required.');
    return;
  }

  if (!lines.length) {
    setStatus('Select at least one line of business.');
    return;
  }

  const result = await window.policygptRater.saveCarrier({
    name,
    key,
    loginUrl: newCarrierLoginUrlInput.value.trim(),
    quoteUrl: newCarrierQuoteUrlInput.value.trim(),
    mode: newCarrierModeInput.value,
    enabled: newCarrierEnabledInput.checked,
    lines,
    lineWorkflows: getLineWorkflows(lines),
    username: newCarrierUsernameInput.value.trim(),
    password: newCarrierPasswordInput.value
  });

  if (result.ok) {
    setStatus(`Carrier saved: ${result.carrier.name}.`);
    clearNewCarrierForm();
    await refreshCarrierViews();
  } else {
    setStatus('Carrier save failed.');
  }
});

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
