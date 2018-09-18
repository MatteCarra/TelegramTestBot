module.exports = = (dynamodb) => {
  const e = {};

  const addElementToCalendario = e.addElementToCalendario = (group_id, date, message, type) => {
    return dynamodb.putItem({
      TableName: "calendario",
      ReturnConsumedCapacity: "NONE",
      Item: {
        "id": {
          N: group_id.toString()
        },
        "data": {
          N: date.toString()
        },
        "testo": {
          S: message
        },
        "tipo": {
          N: type.toString()
        }
      }
    }).promise()
  }

  return e;
}