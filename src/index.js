const express = require('express');
const AWS = require('aws-sdk');
const { aws, telegram: { id: myId } } = require('../credentials.json');
const app = express();
const { sendMessage } = require("./TelegramApi.js");
const { getSetup } = require('./tables/setup.js');
const bodyParser = require('body-parser');

// respond with "hello world" when a GET request is made to the homepage
app.use(bodyParser.json())

app.post('/', function (req, res) {
  const { message, callback_query } = req.body;
  console.log(req.body)
  if(message) {
    const { message_id, from, chat, date, text, new_chat_member } = message;

    if(new_chat_member) {
      const { id, first_name } = new_chat_member;
      if(id === myId) {
        sendMessage(chat.id, "Buongiorno, sono ScuolaBot!\r\nSpero di aiutarvi a superare al meglio l'anno scolastico, ricordandovi gli impegni scolastici e aiutandovi a fissare le interrogazioni programmate!\r\nPer iniziare mi servono un paio di informazioni.", { reply_markup: { inline_keyboard: [[{ text: "1°", "callback_data": "1"}, { text: "2°", "callback_data": "2"}]]}})
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
    sendMessage("Hey, nice pick!")
  } else {
    console.log(req.body)
  }

  return res.json({})
});


const handleMessage = ({ text, chat, from }) => {

}

app.listen(9000, () => console.log('Example app listening on port 9000!'))