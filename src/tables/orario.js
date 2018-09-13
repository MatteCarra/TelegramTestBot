const e = module.exports = {};

const createOrario = e.createOrario = (classe, giorno, ora, materia = null) => {
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

const updateOrario = e.updateOrario = (classe, giornoNew = null, oraNew = null, materiaNew = null) => {
  return getOrario(classe)
    .then(( {Item }) => {
      const { giorno, ora, materia } = Item;
      return createOrario(classe, giornoNew || giorno.N, oraNew || ora.N, materiaNew || materia.S)
    })
}

const getOrario = e.getOrario = (classe) => {
  return dynamodb.getItem({
    TableName: "classe",
    Key: {
      "id": {
        S: classe
      }
    }
  }).promise()
}