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
    const activeOnly = event.queryStringParameters?.activeOnly === "true";
    const params = { TableName: TABLE };

    if (activeOnly) {
      params.FilterExpression = "active = :a";
      params.ExpressionAttributeValues = { ":a": true };
    }

    const result = await dynamo.scan(params).promise();
    const products = (result.Items || []).sort((a, b) => (a.id || 0) - (b.id || 0));

    return { statusCode: 200, headers, body: JSON.stringify(products) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to fetch products" }) };
  }
};
