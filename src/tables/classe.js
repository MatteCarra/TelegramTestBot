module.exports = (dynamodb) => {
  const e = {};

  const createClasse = e.createClasse = (group_id, anno, sezione, tipo) => {
    return dynamodb.putItem({
      TableName: "classe",
      ReturnConsumedCapacity: "NONE",
      Item: {
        "id": {
          N: group_id.toString()
        },
        "anno": {
          N: anno.toString()
        },
        "sezione": {
          S: sezione
        },
        "tipo": {
          N: tipo.toString()
        }
      }
    }).promise()
  }

  const getClasse = e.getClasse = (id) => {
    return dynamodb.getItem({
      TableName: "classe",
      Key: {
        "id": {
          N: id
        }
      }
    }).promise()
  }

  const updateClasse = e.updateClasse = (id, annoNew = null, sezioneNew = null, tipoNew = null) => {
    return getClasse(id)
      .then(({ Item }) => {
        const { anno, sezione, tipo } = Item;
        return createClasse(id, annoNew || anno.N, sezioneNew || sezione.S, tipoNew || tipo.N)
      })
  }

  return e;
}