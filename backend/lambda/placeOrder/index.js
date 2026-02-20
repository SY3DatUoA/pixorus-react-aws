const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE = process.env.ORDERS_TABLE || "pixorus-orders-prod";
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
    const { cartItems } = JSON.parse(event.body || "{}");
    const id = await getNextId("orderId");

    const order = {
      id,
      items: cartItems.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image || "",
      })),
      total: cartItems.reduce((s, i) => s + i.price * i.qty, 0),
      date: new Date().toISOString(),
      status: "completed",
    };

    await dynamo.put({ TableName: TABLE, Item: order }).promise();
    return { statusCode: 201, headers, body: JSON.stringify(order) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to place order" }) };
  }
};
