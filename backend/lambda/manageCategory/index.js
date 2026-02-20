const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE = process.env.CATEGORIES_TABLE || "pixorus-categories-prod";
const COUNTER_TABLE = process.env.COUNTER_TABLE || "pixorus-counters-prod";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

async function getNextId(counterName) {
  const result = await dynamo.update({
    TableName: COUNTER_TABLE,
    Key: { counterName },
    UpdateExpression: "ADD #val :inc",
    ExpressionAttributeNames: { "#val": "value" },
    ExpressionAttributeValues: { ":inc": 1 },
    ReturnValues: "UPDATED_NEW",
  }).promise();
  return result.Attributes.value;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  const method = event.httpMethod;

  try {
    if (method === "POST") {
      const { name, icon } = JSON.parse(event.body || "{}");
      const id = await getNextId("categoryId");
      const cat = { id, name, icon: icon || "fa-tag" };
      await dynamo.put({ TableName: TABLE, Item: cat }).promise();
      return { statusCode: 201, headers, body: JSON.stringify(cat) };
    }

    if (method === "PUT") {
      const id = parseInt(event.pathParameters?.id);
      const { name, icon } = JSON.parse(event.body || "{}");
      await dynamo.update({
        TableName: TABLE,
        Key: { id },
        UpdateExpression: "SET #name = :name, #icon = :icon",
        ExpressionAttributeNames: { "#name": "name", "#icon": "icon" },
        ExpressionAttributeValues: { ":name": name, ":icon": icon || "fa-tag" },
      }).promise();
      return { statusCode: 200, headers, body: JSON.stringify({ updated: true }) };
    }

    if (method === "DELETE") {
      const id = parseInt(event.pathParameters?.id);
      await dynamo.delete({ TableName: TABLE, Key: { id } }).promise();
      return { statusCode: 200, headers, body: JSON.stringify({ deleted: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Category operation failed" }) };
  }
};
