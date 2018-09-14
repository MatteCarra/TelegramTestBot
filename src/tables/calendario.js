module.exports = = (dynamoDb) => {
  const e = {};

  const addElementToCalendario = e.addElementToCalendario = (group_id, date, message, type) => {
    return dynamodb.putItem({
      TableName: "calendario",
      ReturnConsumedCapacity: "NONE",
      Item: {
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

  return e;
}