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
    const updates = JSON.parse(event.body || "{}");

    const allowed = ["name", "price", "originalPrice", "category", "badge", "rating", "reviews", "image", "desc", "active"];
    const parts = [], names = {}, values = {};

    allowed.forEach(field => {
      if (updates[field] !== undefined) {
        parts.push(`#${field} = :${field}`);
        names[`#${field}`] = field;
        values[`:${field}`] = updates[field];
      }
    });

    if (parts.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "No valid fields to update" }) };
    }

    await dynamo.update({
      TableName: TABLE,
      Key: { id },
      UpdateExpression: `SET ${parts.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    }).promise();

    return { statusCode: 200, headers, body: JSON.stringify({ updated: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to update product" }) };
  }
};
