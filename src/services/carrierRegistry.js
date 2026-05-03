const fs = require('fs');
const path = require('path');

const CARRIERS_PATH = path.join(__dirname, '../config/carriers.json');

function readCarriers() {
  if (!fs.existsSync(CARRIERS_PATH)) {
    return {};
  }

  const raw = fs.readFileSync(CARRIERS_PATH, 'utf8');
  return JSON.parse(raw);
}

function writeCarriers(carriers) {
  fs.writeFileSync(CARRIERS_PATH, JSON.stringify(carriers, null, 2));
}

function getAllCarriers() {
  return readCarriers();
}

function getEnabledCarriers() {
  const carriers = readCarriers();

  return Object.entries(carriers)
    .filter(([, carrier]) => carrier.enabled)
    .reduce((acc, [key, carrier]) => {
      acc[key] = carrier;
      return acc;
    }, {});
}

function getCarriersForLine(lineOfBusiness) {
  const carriers = readCarriers();

  return Object.entries(carriers)
    .filter(([, carrier]) => {
      return carrier.enabled && Array.isArray(carrier.lines) && carrier.lines.includes(lineOfBusiness);
    })
    .map(([key, carrier]) => {
      return {
        key,
        ...carrier
      };
    });
}

function normalizeCarrierKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function saveCarrier(carrierInput) {
  const carriers = readCarriers();

  const key = normalizeCarrierKey(carrierInput.key || carrierInput.name);

  if (!key) {
    throw new Error('Carrier key is required.');
  }

  const lines = Array.isArray(carrierInput.lines)
    ? carrierInput.lines
    : String(carrierInput.lines || '')
        .split(',')
        .map((line) => line.trim())
        .filter(Boolean);

  carriers[key] = {
    name: carrierInput.name || key,
    enabled: carrierInput.enabled !== false,
    loginUrl: carrierInput.loginUrl || '',
    quoteUrl: carrierInput.quoteUrl || '',
    lines,
    mode: carrierInput.mode || 'realtime'
  };

  writeCarriers(carriers);

  return {
    key,
    ...carriers[key]
  };
}

module.exports = {
  getAllCarriers,
  getEnabledCarriers,
  getCarriersForLine,
  saveCarrier,
  normalizeCarrierKey
};
