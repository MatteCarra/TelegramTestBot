const e = module.exports = {};

const { createOrario } = require('./orario.js')
const { updateClasse } = require('./classe.js')
const { sendMessage } = require('../TelegramApi.js')

//TODo check if that's the only checkout for that class
const initSetup = e.initSetup = (classe, user_id, tipo, parameters, passaggio = 0) => {
  return dynamodb.putItem({
    Item: {
      TableName: "calendario",
      ReturnConsumedCapacity: "NONE",
      "classe": {
        S: classe
      },
      "user_id": {
        N: user_id
      },
      "tipo": {
        N: tipo
      },
      "parameters": {
        M: parameters
      },
      "passaggio": {
        N: passaggio
      }
    }
  }).promise()
}

const updateSetup = e.updateSetup = (classe, parametersNew = {}) => {
  return getSetup(classe)
    .then(({ Item }) => {
      const { tipo, user_id, parameters, passaggio } = Item;
      return initSetup(classe, user_id, tipo.N, { ...parametersNew, ...parameters.M }, passaggio.N+1)
    })
}

const getSetup = e.getSetup = (classe) => {
  return dynamodb.getItem({
    TableName: "setup",
    Key: {
      "classe": {
        S: classe
      }
    }
  }).promise()
}

//Tipo:
//0 = classe
//1 = calendario
//3 = orario
//4 = interrogazione
const handleSetup = e.handleSetup = (classe, user_id, message, setup) => {
  if(user_id !== setup.user_id) {
    return sendMessage(classe, "Solo chi ha iniziato il setup può rispondere")
  }

  switch (setup.tipo.N) {
    case 0: //classe
      handleSchoolSetup(classe, message, setup)
      break;
    case 1: //calendario

      break;
    case 2: //orario
      handleOrarioSetup(classe, message, setup)
      break;
    case 3: //interrogazione

      break;
  }
}

const handleOrarioSetup = (classe, event, setup) => {
  const { key1, key2, passaggio } = setup
  switch (passaggio) {
    case 0: //viene mandato il giorno
      updateSetup(classe. null, { "giorno" : { N: event.text } })
      break;
    case 1: //ora
      createOrario(classe, key2.M.ora.S, event.text)
      updateSetup(classe, null, { "giorno-ora" : { S: `${key2}-${event.text}` } })
      break;
    case 2:
      updateOrario(classe, null, null, event.text)
      //TODO elimina
      break;
  }
}

const handleSchoolSetup = e.handleSchoolSetup = (classe, event, setup) => {
  const { parameters, passaggio } = setup;
  switch (passaggio) {
    case 0:
      return updateSetup(classe, { tipo: convertClassTypeToInt(event)})
    case 1:
      return updateSetup(classe, { anno: parseInt(event.charAt(event.length - 1), 10)})
    case 2:
      return createClasse(classe, parameters.anno, 'TODO', parameters.tipo)
  }
}

const convertClassTypeToInt = (sType) => {
  switch (sType) {
    case "elementari": return 0;
    case "medie": return 1;
    case "superiori": return 2;
  }
}