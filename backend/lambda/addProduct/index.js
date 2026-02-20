const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE = process.env.PRODUCTS_TABLE || "pixorus-products-prod";
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

  try {
    const body = JSON.parse(event.body || "{}");
    const id = await getNextId("productId");

    const product = {
      id,
      name: body.name || "",
      price: Number(body.price) || 0,
      originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
      category: body.category || "",
      badge: body.badge || null,
      rating: Number(body.rating) || 0,
      reviews: Number(body.reviews) || 0,
      image: body.image || "",
      desc: body.desc || "",
      active: true,
    };

    await dynamo.put({ TableName: TABLE, Item: product }).promise();
    return { statusCode: 201, headers, body: JSON.stringify(product) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to add product" }) };
  }
};
