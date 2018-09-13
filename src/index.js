const express = require('express');
const AWS = require('aws-sdk');
const { aws, telegram: { id: myId } } = require('../credentials.json');
const app = express();
const { sendMessage } = require("./TelegramApi.js");
const { getSetup, initSetup, handleSetup } = require('./tables/setup.js');
const bodyParser = require('body-parser');

// respond with "hello world" when a GET request is made to the homepage
app.use(bodyParser.json())

app.post('/', function (req, res) {
  const { message, callback_query } = req.body;
  console.log(JSON.stringify(req.body))
  if(message) {
    const { message_id, from, chat, date, text, new_chat_member } = message;

    if(new_chat_member) {
      const { id, first_name } = new_chat_member;
      if(id === myId) {
        initSetup(chat.id, from.id, 0, { id: { N: chat.id } })
          .then(() =>
            sendMessage(
              chat.id,
              "Buongiorno, sono ScuolaBot!\r\nSpero di aiutarvi a superare al meglio l'anno scolastico, ricordandovi gli impegni scolastici e aiutandovi a fissare le interrogazioni programmate!\r\nPer iniziare mi servono un paio di informazioni. Che scuola frequenti?",
              { reply_markup: { inline_keyboard: [[{ text: "Elementari", "callback_data": "elementari"}, { text: "Medie", "callback_data": "medie"}, { text: "Superiori", "callback_data": "superiori"}]]}})
          )
      } else {
        sendMessage(chat.id, `Benvenuto/a nella classe ${first_name}!`)
      }
    } else if(text) {
      if(chat.id === from.id) { //private chat
        //Todo I've to get if this user is part of a classe. If he is I'm getting his class and showing
      } else { //group

      }
    } else {
      console.log(req.body)
    }
  } else if(callback_query) {
    const { from, message, data } = callback_query;
    sendMessage(message.chat.id, "Hey, nice pick!")
  } else {
    console.log(req.body)
  }

  return res.json({})
});


const handleCallbackQuery = (from, message, data) => {
  const { chat: { id } } = message;
  switch (data) {
    case "elementari":
    case "medie":
    case "superiori":
      getSetup(id)
        .then(setup => handleSetup(id, from.id, data, setup))
        .then(() => pickClassYear(id, data === "medie" ? 3 : 5))
      break;
    case "classe_anno_1":
    case "classe_anno_2":
    case "classe_anno_3":
    case "classe_anno_4":
    case "classe_anno_5":
      getSetup(id)
        .then(setup => handleSetup(id, from.id, data, setup))
        .then(() => )
      break;
  }
}

const fillYearsArray = (n) => {
  const arr = [[]];
  for(let i = 0; i < n; i++) {
    const obj = { text: `${i+1}°`, callback_data: `classe_anno_${i+1}`};
    if(arr.length <= i/2)
      arr.push([obj])
    else
      arr[~~(i/2)].push(obj)
  }
  return arr;
}

const pickClassYear = (chat_id, options = 5) =>
  sendMessage(
    chat_id,
    "Che anno frequentate?",
    { reply_markup: { inline_keyboard: fillYearsArray(options)}}
  )


const handleMessage = ({ text, chat, from }) => {

}

app.listen(9000, () => console.log('Example app listening on port 9000!'))