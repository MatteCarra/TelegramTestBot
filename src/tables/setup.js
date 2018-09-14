module.exports = (dynamodb) => {
  const e = {};

//TODo check if that's the only checkout for that class
  //Tipo:
  //0 = classe
  //1 = calendario
  //3 = orario
  //4 = interrogazione
  const initSetup = e.initSetup = (classe, user_id, tipo, parameters, passaggio = 0) => {
    return dynamodb.putItem({
      TableName: "calendario",
      ReturnConsumedCapacity: "NONE",
      Item: {
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

  return e;
}
