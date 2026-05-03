const keytar = require('keytar');

const SERVICE = 'PolicyGPT-Rater';

async function saveCredential(account, value) {
  if (!account || !value) {
    throw new Error('Missing credential account or value.');
  }

  await keytar.setPassword(SERVICE, account, value);
}

async function getCredential(account) {
  if (!account) {
    throw new Error('Missing credential account.');
  }

  return await keytar.getPassword(SERVICE, account);
}

async function deleteCredential(account) {
  if (!account) {
    throw new Error('Missing credential account.');
  }

  return await keytar.deletePassword(SERVICE, account);
}

module.exports = {
  saveCredential,
  getCredential,
  deleteCredential
};
