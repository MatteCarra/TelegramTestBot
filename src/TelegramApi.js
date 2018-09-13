const fetch = require('node-fetch');
const { telegram } = require('../credentials.json');

const e = module.exports = {};

const callTelegramApi = (method, body) => {
  return fetch(getUrl(method), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  });
};

const getUrl = e.getUrl = method => `https://api.telegram.org/bot${telegram}/${method}`;
e.deleteWebhook = () => callTelegramApi('deleteWebhook');
e.setWebhook = (webhook) => callTelegramApi('setWebhook', { url: webhook });
e.sendMessage = ({ chat_id, text }) => callTelegramApi('sendMessage', { chat_id, text });
e.sendPhoto = ({ chat_id, photo }) => callTelegramApi('sendPhoto', { chat_id, photo });