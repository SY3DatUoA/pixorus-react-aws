/**
 * uploadImage Lambda
 *
 * Uses the AWS SDK v2 (`aws-sdk`) which is pre-installed on every
 * Node.js Lambda runtime — NO npm install or bundling required.
 *
 * Flow:
 *   1. Admin frontend sends { fileName, fileType }
 *   2. This function generates a pre-signed S3 PUT URL (valid 5 min)
 *   3. Frontend uploads the file directly to S3 using that URL
 *   4. Frontend stores the returned publicUrl on the product record
 */

// aws-sdk is built into every Lambda runtime (nodejs18.x / nodejs20.x)
const AWS = require("aws-sdk");

const s3 = new AWS.S3();
const BUCKET = process.env.IMAGES_BUCKET;

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];
const ALLOWED_MIME_TYPES  = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const URL_EXPIRY_SECONDS  = 300; // 5 minutes

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { fileName, fileType } = body;

    // ── Validation ────────────────────────────────────────────────
    if (!fileName || !fileType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Both 'fileName' and 'fileType' are required." }),
      };
    }

    const ext = fileName.split(".").pop().toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `File type '.${ext}' is not allowed. Use: jpg, png, webp, or gif.` }),
      };
    }

    if (!ALLOWED_MIME_TYPES.includes(fileType.toLowerCase())) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `MIME type '${fileType}' is not allowed.` }),
      };
    }

    // ── Build a unique S3 key ──────────────────────────────────────
    // e.g. products/1718123456789-leather_wallet.jpg
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `products/${Date.now()}-${safeFileName}`;

    // ── Generate presigned PUT URL (SDK v2 style — no extra packages) ──
    const uploadUrl = await s3.getSignedUrlPromise("putObject", {
      Bucket:      BUCKET,
      Key:         key,
      ContentType: fileType,
      ACL:         "public-read",   // object is publicly readable once uploaded
      Expires:     URL_EXPIRY_SECONDS,
    });

    // The permanent public URL the frontend will store on the product
    const publicUrl = `https://${BUCKET}.s3.amazonaws.com/${key}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ uploadUrl, publicUrl, key }),
    };

  } catch (err) {
    console.error("uploadImage error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to generate upload URL." }),
    };
  }
};
