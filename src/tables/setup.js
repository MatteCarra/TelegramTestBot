module.exports = (dynamodb) => {
  const e = {};

//TODo check if that's the only checkout for that class
  //Tipo:
  //0 = classe
  //1 = calendario
  //2 = orario new
  //3 = interrogazione
  //4 = orario edit
  const initSetup = e.initSetup = (classe, user_id, tipo, parameters = {}, passaggio = 0) => {
    return dynamodb.putItem({
      TableName: "setup",
      ReturnConsumedCapacity: "NONE",
      Item: {
        "classe": {
          N: classe.toString()
        },
        "user_id": {
          N: user_id.toString()
        },
        "tipo": {
          N: tipo.toString()
        },
        "parameters": {
          M: parameters
        },
        "passaggio": {
          N: passaggio.toString()
        }
      }
    }).promise()
  }

  const updateSetup = e.updateSetup = (classe, parametersNew = {}) => {
    return getSetup(classe)
      .then(({ Item }) => {
        const { tipo, user_id, parameters, passaggio } = Item;
        console.log({ ...parametersNew, ...parameters.M })
        return initSetup(classe, user_id.N, tipo.N, { ...parametersNew, ...parameters.M }, parseInt(passaggio.N, 10) + 1)
      })
  }

  const getSetup = e.getSetup = (classe) => {
    return dynamodb.getItem({
      TableName: "setup",
      Key: {
        "classe": {
          N: classe.toString()
        }
      }
    }).promise()
  }

  const deleteSetup = e.deleteSetup = (classe) => {
    return dynamodb.deleteItem({
      TableName: "setup",
      Key: {
        "classe": {
          N: classe.toString()
        }
      }
    }).promise()
  }

  return e;
}
