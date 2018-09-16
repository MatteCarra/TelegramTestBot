module.exports = (dynamodb) => {
  const e = {};

//TODo check if that's the only checkout for that class
  //Tipo:
  //0 = classe
  //1 = calendario
  //3 = orario
  //4 = interrogazione
  const initSetup = e.initSetup = (classe, user_id, tipo, parameters, passaggio = 0) => {
    console.log('---------------------')
    console.log(classe)
    console.log(user_id)
    console.log(tipo)
    console.log(parameters)
    console.log(passaggio)
    console.log('---------------------')

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

  return e;
}
