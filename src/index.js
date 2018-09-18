const express = require('express');
const AWS = require('aws-sdk');
const { aws, telegram: { id: myId } } = require('../credentials.json');
const dynamodb = new AWS.DynamoDB(aws);
const app = express();
const { sendMessage } = require("./TelegramApi.js");
const { getSetup, initSetup, updateSetup, deleteSetup } = require('./tables/setup.js')(dynamodb);
const { createClasse } = require('./tables/classe.js')(dynamodb);
const { getOrario, createOrario } = require('./tables/orario.js')(dynamodb);
const bodyParser = require('body-parser');

// respond with "hello world" when a GET request is made to the homepage
app.use(bodyParser.json())

const commandMenuOrario = "🗓 ORARIO 🗓";
const commandMenuCalendario = "📆 CALENDARIO 📆";
const commandMenuInterrogazioni = "❓ INTERROGAZIONI PROGRAMMATE ❓";

const menu = {
  reply_markup: {
    keyboard: [
      [
        { text: commandMenuOrario }
      ],
      [
        { text: commandMenuCalendario }
      ],
      [
        { text: commandMenuInterrogazioni }
      ]
    ]
  }
}

const menuOrario = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "Visualizza", "callback_data": "orario_view"},
      ],
      [
        { text: "Modifica", "callback_data": "orario_edit"}
      ]
    ]
  }
}



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
        handleSetup(chat.id, from, message)
          .catch(() =>
            handleMessage(message)
          )
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
      handleSetup(id, from, data)
      break;
    case "classe_anno_1":
    case "classe_anno_2":
    case "classe_anno_3":
    case "classe_anno_4":
    case "classe_anno_5":
      handleSetup(id, from, data)
      break;
    case "orario_view":
      //TODO
      break;
    case "orario_edit":
      return getOrario(id)
        .then(({ Item }) => {
          if(Item) {

          } else {
            return initSetup(id, from.id, 5)
              .then(() => sendMessage(id, "Che giorno vuoi modificare?", {
                reply_markup: {
                  inline_keyboard: [
                    [
                      { text: "Lunedì", "callback_data": "orario_edit_giorno_0"},
                      { text: "Martedì", "callback_data": "orario_edit_giorno_1"},
                      { text: "Mercoledì", "callback_data": "orario_edit_giorno_2"}
                    ],
                    [
                      { text: "Giovedì", "callback_data": "orario_edit_giorno_3"},
                      { text: "Venerdì", "callback_data": "orario_edit_giorno_4"},
                      { text: "Sabato", "callback_data": "orario_edit_giorno_5"}
                    ]
                  ]
                }
              }))
          }
        })
        .catch(err => {
          console.log(err)
          console.log('wtf')
        })
    case "orario_edit_giorno_0":
    case "orario_edit_giorno_1":
    case "orario_edit_giorno_2":
    case "orario_edit_giorno_3":
    case "orario_edit_giorno_4":
    case "orario_edit_giorno_5":
      return handleSetup(id, from, data.substring(data.length-2));
    case "orario_edit_ora_1":
    case "orario_edit_ora_2":
    case "orario_edit_ora_3":
    case "orario_edit_ora_4":
    case "orario_edit_ora_5":
    case "orario_edit_ora_6":
    case "orario_edit_ora_7":
      return handleSetup(id, from, data.substring(data.length-2));
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

const handleCommands = (classe, user, message) => {
  switch (message.text) {
    case commandOrario:

      break
    case commandCalendario:

      break;
    case commandInterrogazioni:

      break;

  }
}

const handleSetup = (classe, user, message) => {
  return getSetup(classe)
    .then(setup => {
      if(!setup.Item) {
        return Promise.reject()
      }
      const { Item: { user_id, tipo } } = setup;

      if(user.id.toString() !== user_id.N) {
        return;
      }

      switch (tipo.N) {
        case "0": //classe
          return handleSchoolSetup(classe, message, setup, user)
        case "1": //calendario

          break;
        case "2": //orario
          //TODO ?
          return handleOrarioSetupEdit(classe, message, setup, user)
        case "3": //interrogazione

          break;
        case "4": //orario edit
          return handleOrarioSetupEdit(classe, message, setup)
        default:
          return Promise.reject()
      }
    })
}

const handleOrarioSetupEdit = (classe, message, setup, user) => {
  console.log(message)
  const { Item: { parameters, passaggio } } = setup
  switch (passaggio) {
    case "0": //viene mandato il giorno
      return updateSetup(classe. null, { "giorno" : { N: message } })
        .then(() =>
          sendMessage(classe, "Che ora vuoi impostare?", {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "1°", "callback_data": "orario_edit_ora_1"},
                  { text: "2°", "callback_data": "orario_edit_ora_2"},
                  { text: "3°", "callback_data": "orario_edit_ora_3"},
                  { text: "4°", "callback_data": "orario_edit_ora_4"},
                ],
                [
                  { text: "5°", "callback_data": "orario_edit_ora_5"},
                  { text: "6°", "callback_data": "orario_edit_ora_6"},
                  { text: "7°", "callback_data": "orario_edit_ora_7"},
                  { text: "8°", "callback_data": "orario_edit_ora_8"}
                ]
              ]
            }
          })
        )
    case "1": //ora
      return updateSetup(classe, null, { "ora" : { N: message } })
        .then(() => sendMessage(classe, `@${user.username} Che materia hai alla ${message}° ora?`))
    case "2": //materia
      return createOrario(classe, parameters.M.giorno.N, parameters.M.ora.N, message.text)
        .then(() => deleteSetup(classe))
        .then(() => sendMessage(classe, "Impostazione orario completata con successo.", menuOrariog))
    default:
      return Promise.reject();
  }

}

const handleSchoolSetup = (classe, message, setup, user) => {
  const { Item: { parameters, passaggio } } = setup;
  console.log("passaggio: "+ passaggio.N)
  console.log(message)
  switch (passaggio.N) {
    case "0":
      return updateSetup(classe, { tipo: { N: convertClassTypeToInt(message).toString() } })
        .then(() => pickClassYear(classe, message === "medie" ? 3 : 5))
    case "1":
      return updateSetup(classe, { anno: { N: parseInt(message.charAt(message.length - 1), 10).toString() } })
        .then(() => sendMessage(classe, `@${user.username} Che corso frequentate?`, { reply_markup: { keyboard, one_time_keyboard: true, selective: true } }))
        .then((res) => updateSetup(classe, { message_id: { N: `${res.result.message_id}` }}))
    case "3":
      if(message.reply_to_message.message_id.toString() === parameters.M.message_id.N) {
        return createClasse(classe, parameters.M.anno.N, message.text, parameters.M.tipo.N)
          .then(() => deleteSetup(classe))
          .then(() => sendMessage(classe, 'Creazione completata!', menu));
      }
    default:
      return Promise.reject();
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
  switch (text) {
    case commandMenuCalendario:

      break;
    case commandMenuInterrogazioni:

      break;
    case commandMenuOrario:
      sendMessage(chat.id, "Che operazione vuoi eseguire?", menuOrario)
      break;
  }
}

app.listen(9000, () => console.log('Example app listening on port 9000!'))