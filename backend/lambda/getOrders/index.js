const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE = process.env.ORDERS_TABLE || "pixorus-orders-prod";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  try {
    const result = await dynamo.scan({ TableName: TABLE }).promise();
    const orders = (result.Items || []).sort((a, b) => new Date(b.date) - new Date(a.date));
    return { statusCode: 200, headers, body: JSON.stringify(orders) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to fetch orders" }) };
  }
};
