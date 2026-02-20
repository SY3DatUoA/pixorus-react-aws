const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE = process.env.PRODUCTS_TABLE || "pixorus-products-prod";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  try {
    const id = parseInt(event.pathParameters?.id);
    await dynamo.delete({ TableName: TABLE, Key: { id } }).promise();
    return { statusCode: 200, headers, body: JSON.stringify({ deleted: true, id }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to delete product" }) };
  }
};
