const fetch = require('node-fetch');
const { telegram: { token } } = require('../credentials.json');
const e = module.exports = {};

const callTelegramApiGet = (method) => {
  return fetch(getUrl(method), {
    method: 'GET'
  });
};

const callTelegramApi = (method, body) => {
  return fetch(getUrl(method), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json());
};

const getUrl = e.getUrl = method => `https://api.telegram.org/bot${token}/${method}`;
e.deleteWebhook = () => callTelegramApi('deleteWebhook');
e.setWebhook = (webhook) => callTelegramApi('setWebhook', { url: webhook });
e.getWebhookInfo = () => callTelegramApiGet('getWebhookInfo');
e.sendMessage = (chat_id, text, custom = {}) => callTelegramApi('sendMessage', { chat_id, text, ...custom });
e.sendPhoto = (chat_id, photo) => callTelegramApi('sendPhoto', { chat_id, photo });