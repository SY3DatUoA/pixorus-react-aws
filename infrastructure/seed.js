// ===== PIXORUS DB SEEDER =====
// Run this ONCE after deploying CloudFormation to populate DynamoDB with
// initial products, categories, and counter values.
//
// Usage:
//   npm install @aws-sdk/client-dynamodb @aws-sdk/util-dynamodb
//   node seed.js --region us-east-1 --stage prod

const { DynamoDBClient, PutItemCommand, BatchWriteItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");

const args = process.argv.slice(2);
const region = args[args.indexOf("--region") + 1] || "us-east-1";
const stage = args[args.indexOf("--stage") + 1] || "prod";

const PRODUCTS_TABLE = `pixorus-products-${stage}`;
const CATEGORIES_TABLE = `pixorus-categories-${stage}`;
const COUNTERS_TABLE = `pixorus-counters-${stage}`;

const client = new DynamoDBClient({ region });

const CATEGORIES = [
  { id: 1, name: "Fashion",     icon: "fa-shirt" },
  { id: 2, name: "Electronics", icon: "fa-microchip" },
  { id: 3, name: "Beauty",      icon: "fa-spa" },
  { id: 4, name: "Accessories", icon: "fa-gem" },
];

const PRODUCTS = [
  { id:1,  name:"Leather Bag",         price:450, originalPrice:599, category:"Fashion",     badge:"sale", rating:4.8, reviews:124, image:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop", desc:"Premium handcrafted leather bag with brass hardware.",                                                   active:true },
  { id:2,  name:"Glow Face Cream",     price:30,  originalPrice:null, category:"Beauty",      badge:"new",  rating:4.5, reviews:89,  image:"https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop", desc:"Hydrating face cream with vitamin C and hyaluronic acid.",                                                active:true },
  { id:3,  name:"DSLR Camera Pro",     price:900, originalPrice:1200, category:"Electronics", badge:"sale", rating:4.9, reviews:312, image:"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop", desc:"Professional-grade DSLR camera with 45MP sensor, 4K video.",                                              active:true },
  { id:4,  name:"Kids Sneakers",       price:60,  originalPrice:80,  category:"Fashion",     badge:"sale", rating:4.3, reviews:67,  image:"https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=400&h=400&fit=crop", desc:"Comfortable and durable sneakers for active kids.",                                                        active:true },
  { id:5,  name:"Smart Watch X",       price:200, originalPrice:null, category:"Electronics", badge:"hot",  rating:4.7, reviews:256, image:"https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400&h=400&fit=crop", desc:"Next-gen smartwatch with health tracking, GPS, and 7-day battery life.",                                    active:true },
  { id:6,  name:"Diamond Earrings",    price:320, originalPrice:400, category:"Accessories", badge:"sale", rating:4.6, reviews:45,  image:"https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop", desc:"Elegant diamond stud earrings set in 14k white gold.",                                                    active:true },
  { id:7,  name:"Silk Scarf",          price:85,  originalPrice:null, category:"Fashion",     badge:"new",  rating:4.4, reviews:33,  image:"https://images.unsplash.com/photo-1601924921557-45e6dea0e2ff?w=400&h=400&fit=crop", desc:"Luxurious hand-painted silk scarf with vibrant patterns.",                                                active:true },
  { id:8,  name:"Wireless Earbuds",    price:150, originalPrice:189, category:"Electronics", badge:"hot",  rating:4.8, reviews:478, image:"https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop", desc:"Premium wireless earbuds with active noise cancellation, 30hr battery.",                                   active:true },
  { id:9,  name:"Vitamin C Serum",     price:45,  originalPrice:null, category:"Beauty",      badge:"new",  rating:4.6, reviews:201, image:"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop", desc:"Brightening vitamin C serum with ferulic acid.",                                                           active:true },
  { id:10, name:"Titanium Sunglasses", price:175, originalPrice:220, category:"Accessories", badge:"sale", rating:4.5, reviews:92,  image:"https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop", desc:"Ultra-lightweight titanium frame sunglasses with polarized UV400 lenses.",                                active:true },
];

const COUNTERS = [
  { counterName: "productId",  value: 11 },
  { counterName: "categoryId", value: 5 },
  { counterName: "orderId",    value: 1001 },
];

async function putItem(table, item) {
  await client.send(new PutItemCommand({
    TableName: table,
    Item: marshall(item, { removeUndefinedValues: true }),
  }));
}

async function seed() {
  console.log(`\nSeeding Pixorus data into stage: ${stage} (region: ${region})\n`);

  console.log("→ Seeding counters...");
  for (const c of COUNTERS) {
    await putItem(COUNTERS_TABLE, c);
    console.log(`   ✓ Counter: ${c.counterName} = ${c.value}`);
  }

  console.log("\n→ Seeding categories...");
  for (const cat of CATEGORIES) {
    await putItem(CATEGORIES_TABLE, cat);
    console.log(`   ✓ ${cat.name}`);
  }

  console.log("\n→ Seeding products...");
  for (const product of PRODUCTS) {
    await putItem(PRODUCTS_TABLE, product);
    console.log(`   ✓ ${product.name}`);
  }

  console.log("\n✅ Seed complete! Your Pixorus store is ready.\n");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
