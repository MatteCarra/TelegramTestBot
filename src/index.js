const express = require('express');
const AWS = require('aws-sdk');
const { aws, telegram: { id: myId } } = require('../credentials.json');
const dynamodb = new AWS.DynamoDB(aws);
const app = express();
const { sendMessage } = require("./TelegramApi.js");
const { getSetup, initSetup, updateSetup } = require('./tables/setup.js')(dynamodb);
const { createClasse } = require('./tables/classe.js')(dynamodb);
const bodyParser = require('body-parser');

// respond with "hello world" when a GET request is made to the homepage
app.use(bodyParser.json())



const keyboard = [
  [
    { text: 'Q' }, { text: 'W' }, { text: 'E' }, { text: 'R' }, { text: 'T' }, { text: 'Y' }, { text: 'U' }, { text: 'I' }, { text: 'O' }, { text: 'P' }
  ],
  [
    { text: 'A' }, { text: 'S' }, { text: 'D' }, { text: 'F' }, { text: 'G' }, { text: 'H' }, { text: 'J' }, { text: 'K' }, { text: 'L' }
  ],
  [
    { text: 'Z' }, { text: 'X' }, { text: 'C' }, { text: 'V' }, { text: 'B' }, { text: 'N' }, { text: 'M' }
  ]
]

app.post('/', function (req, res) {
  const { message, callback_query } = req.body;
  console.log(JSON.stringify(req.body))
  if(message) {
    const { message_id, from, chat, date, text, new_chat_member } = message;

    if(new_chat_member) {
      const { id, first_name } = new_chat_member;
      if(id === myId) {
        initSetup(chat.id, from.id, 0, { id: { N: chat.id.toString() } })
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
        getSetup(chat.id)
          .then(setup => handleSetup(chat.id, from.id, message, setup))
      }
    } else {
      console.log(req.body)
    }
  } else if(callback_query) {
    handleCallbackQuery(callback_query)
  } else {
    console.log(req.body)
  }

  return res.json({})
});


const handleCallbackQuery = ({from, message, data}) => {
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
        .then(() => sendMessage(id, `@${from.username} Che corso frequentate?`, { reply_markup: { keyboard, one_time_keyboard: true, selective: true } }))
        .then((res) => updateSetup(id, { message_id: { N: `${res.result.message_id}` }}))
        .catch(() => {})
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

const handleSetup = (classe, user, message, setup) => {
  const { Item: { user_id, tipo } } = setup
  if(user.toString() !== user_id.N) {
    return Promise.reject(/*sendMessage(classe, "Solo chi ha iniziato il setup può rispondere")*/)
  }

  switch (tipo.N) {
    case "0": //classe
      handleSchoolSetup(classe, message, setup)
      break;
    case "1": //calendario

      break;
    case "2": //orario
      handleOrarioSetup(classe, message, setup)
      break;
    case "3": //interrogazione

      break;
  }
}

const handleOrarioSetup = (classe, event, setup) => {
  const { Item: { parameters, passaggio } } = setup
  switch (passaggio) {
    case "0": //viene mandato il giorno
      updateSetup(classe. null, { "giorno" : { N: event.text } })
      break;
    case "1": //ora
      createOrario(classe, key2.M.ora.S, event.text)
      updateSetup(classe, null, { "giorno-ora" : { S: `${parameters.giorno.N}-${event.text}` } })
      break;
    case "2":
      updateOrario(classe, null, null, event.text)
      //TODO elimina
      break;
  }
}

const handleSchoolSetup = (classe, message, setup) => {
  const { Item: { parameters, passaggio } } = setup;
  console.log("passaggio: "+ passaggio.N)
  console.log(message)
  switch (passaggio.N) {
    case "0":
      return updateSetup(classe, { tipo: { N: convertClassTypeToInt(message).toString() } })
    case "1":
      return updateSetup(classe, { anno: { N: parseInt(message.charAt(message.length - 1), 10).toString() } })
    case "3":
      console.log(message)
      console.log(parameters)
      if(message.reply_to_message.message_id.toString() === parameters.M.message_id.N) {
        return createClasse(classe, parameters.anno, message.text, parameters.tipo)
      }
  }
}

const convertClassTypeToInt = (sType) => {
  switch (sType) {
    case "elementari": return 0;
    case "medie": return 1;
    case "superiori": return 2;
  }
}


const handleMessage = ({ text, chat, from }) => {

}

app.listen(9000, () => console.log('Example app listening on port 9000!'))