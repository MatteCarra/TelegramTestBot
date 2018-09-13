const express = require('express');
const AWS = require('aws-sdk');
const { aws, telegram: { id: myId } } = require('../credentials.json');
const dynamodb = new AWS.DynamoDB(aws);
const app = express();
const { sendMessage } = require("./TelegramApi.js");
const { getClasse } = require('./core.js')
const bodyParser = require('body-parser'

// respond with "hello world" when a GET request is made to the homepage
app.use(bodyParser.json())

app.post('/', function (req, res) {
  const { message_id, from, chat, date, text, new_chat_member } = req.body.message;
  if(new_chat_member) {
    const { id, first_name } = new_chat_member;
    if(id === myId) {
      sendMessage(chat.id, "Test 2")
    } else {
      sendMessage(chat.id, "Test 1")
    }
  } else if(text) {
    if(chat.id === from.id) { //private chat

    } else { //group
      getClasse(chat.id)
    }
  } else {
    console.log(req.body)
  }
  res.json({})
});

app.listen(9000, () => console.log('Example app listening on port 9000!'))