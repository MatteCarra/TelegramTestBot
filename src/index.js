const express = require('express');
const AWS = require('aws-sdk');
const { aws } = require('../credentials.json');
const dynamodb = new AWS.DynamoDB(aws);
const app = express();
const TelegramApi = require("./TelegramApi.js");

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  console.log(req)
    res.send('hello world')
});

app.post('/', function (req, res) {
  console.log(req)
  res.send('hello world')
});

app.listen(9000, () => console.log('Example app listening on port 9000!'))


const handleSchoolSetup = (event, setup) => {
  const { key1, passaggio } = setup;
  switch (passaggio) {
    case 0:
      updateClasse(key1.M.id.N, null, null, event.message) //TODO
      //TODO end setup
      break;
  }
}

const handleOrarioSetup = (classe, event, setup) => {
  const { key1, key2, passaggio } = setup
  switch (passaggio) {
    case 0: //viene mandato il giorno
      updateSetup(classe. null, { "giorno" : { N: event.message } })
      break;
    case 1: //ora
      createOrario(classe, key2.M.ora.S, event.message)
      updateSetup(classe, null, { "giorno-ora" : { S: `${key2}-${event.message}` } })
      break;
    case 2:
      updateOrario(classe, null, null, event.message)
      //TODO elimina
      break;
  }
}

//TODO call on every message to check if
const getSetup = (classe) => {
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
const initSetup = (classe, tipo, key1, key2, passaggio = 0) => {
  return dynamodb.putItem({
    Item: {
      TableName: "calendario",
      ReturnConsumedCapacity: "NONE",
      "classe": {
        S: classe
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

const updateSetup = (classe, key1New = null, key2New = null) => {
  return getSetup(classe)
    .then(({ Item }) => {
      const { tipo, key1, key2, passaggio } = Item;
      return initSetup(classe, tipo.N, key1New || key1.M, key2New || key2.M, passaggio.N+1)
    })
}

const addElementToCalendario = (group_id, date, message, type) => {
  return dynamodb.putItem({
    Item: {
      TableName: "calendario",
      ReturnConsumedCapacity: "NONE",
      "id": {
        N: group_id
      },
      "data": {
        N: date
      },
      "testo": {
        S: message
      },
      "tipo": {
        N: type
      }
    }
  }).promise()
}

const getClasse = (id) => {
  return dynamodb.getItem({
    TableName: "classe",
    Key: {
      "id": {
        S: id
      }
    }
  }).promise()
}

const createOrario = (classe, giorno, ora, materia = null) => {
  return dynamodb.putItem({
    Item: {
      TableName: "orario",
      ReturnConsumedCapacity: "NONE",
      "classe": {
        S: classe
      },
      "giorno-ora": {
        S: `${giorno}-${ora}`
      },
      "giorno": {
        N: giorno
      },
      "ora": {
        N: ora
      },
      "materia": {
        S: materia
      }
    }
  }).promise()
}

const updateOrario = (classe, giornoNew = null, oraNew = null, materiaNew = null) => {
  return getOrario(classe)
    .then(( {Item }) => {
      const { giorno, ora, materia } = Item;
      return createOrario(classe, giornoNew || giorno.N, oraNew || ora.N, materiaNew || materia.S)
    })
}

const getOrario = (classe) => {
  return dynamodb.getItem({
    TableName: "classe",
    Key: {
      "id": {
        S: id
      }
    }
  }).promise()
}

const createClasse = (group_id, anno, sezione, tipo) => {
  return dynamodb.putItem({
    Item: {
      TableName: "classe",
      ReturnConsumedCapacity: "NONE",
      "id": {
        N: group_id
      },
      "anno": {
        N: anno
      },
      "sezione": {
        S: sezione
      },
      "tipo": {
        N: tipo
      }
    }
  }).promise()
}

const updateClasse = (id, annoNew = null, sezioneNew = null, tipoNew = null) => {
  return getClasse(id)
    .then(({ Item }) => {
      const { anno, sezione, tipo } = Item;
      return createClasse(id, annoNew || anno.N, sezioneNew || sezione.S, tipoNew || tipo.N)
    })
}