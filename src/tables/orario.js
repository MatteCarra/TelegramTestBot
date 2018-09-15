module.exports = (dynamodb) => {
  const e = {};

  const createOrario = e.createOrario = (classe, giorno, ora, materia = null) => {
    return dynamodb.putItem({
      TableName: "orario",
      ReturnConsumedCapacity: "NONE",
      Item: {
        "classe": {
          N: classe.toString()
        },
        "giorno-ora": {
          S: `${giorno}-${ora}`
        },
        "giorno": {
          N: giorno.toString()
        },
        "ora": {
          N: ora.toString()
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
          N: classe
        }
      }
    }).promise()
  }

  return e;
}
