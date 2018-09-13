const e = module.exports = {};

const { createOrario } = require('./orario.js')

//TODo check if that's the only checkout for that class
const initSetup = e.initSetup = (classe, user_id, tipo, key1, key2, passaggio = 0) => {
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
      "key1": {
        M: key1
      },
      "key2": {
        M: key2
      },
      "passaggio": {
        N: passaggio
      }
    }
  }).promise()
}

const updateSetup = e.updateSetup = (classe, key1New = null, key2New = null) => {
  return getSetup(classe)
    .then(({ Item }) => {
      const { tipo, user_id, key1, key2, passaggio } = Item;
      return initSetup(classe, user_id, tipo.N, key1New || key1.M, key2New || key2.M, passaggio.N+1)
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
const handleSetup = e.handleSetup = (classe, message, setup) => {
  switch (setup.tipo.N) {
    case 0: //classe

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

const handleSchoolSetup = e.handleSchoolSetup = (event, setup) => {
  const { key1, passaggio } = setup;
  switch (passaggio) {
    case 0:
      updateClasse(key1.M.id.N, null, null, event.message) //TODO
      //TODO end setup
      break;
  }
}