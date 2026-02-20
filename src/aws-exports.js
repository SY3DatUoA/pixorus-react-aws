// ─────────────────────────────────────────────────────────────────────────────
// aws-exports.js  — Generated after running CloudFormation / amplify init
// Replace ALL placeholder values with your actual AWS output values.
// These values come from the CloudFormation stack Outputs tab.
// ─────────────────────────────────────────────────────────────────────────────

const awsExports = {
  // ── Region ──────────────────────────────────────────────────────────────────
  aws_project_region: "us-east-2",

  // ── Cognito User Pool (Admin Auth) ──────────────────────────────────────────
  aws_cognito_region: "us-east-2",
  aws_user_pools_id: "us-east-2_qXO8kHFOj",
  aws_user_pools_web_client_id: "47edciociemavkgvunh74u1pp8",

  // ── Cognito Identity Pool ────────────────────────────────────────────────────
  aws_cognito_identity_pool_id: "us-east-2:a609e83e-2edf-42b9-9599-4b7cd7d0ff27",

  // ── API Gateway ──────────────────────────────────────────────────────────────
  aws_cloud_logic_custom: [
    {
      name: "PixorusAPI",
      endpoint: "https://t19fbnere7.execute-api.us-east-2.amazonaws.com/prod",
      region: "us-east-2",
    },
  ],

  // ── S3 (Product Images) ──────────────────────────────────────────────────────
  aws_user_files_s3_bucket: "pixorus-prodv2-productimagesbucket-77xorxph9lzl",
  aws_user_files_s3_bucket_region: "us-east-2",

  // ── Auth type for API calls ──────────────────────────────────────────────────
  // Public endpoints (GET products, GET categories, POST orders) → NONE
  // Admin endpoints (POST/PUT/DELETE products, categories, GET orders) → AMAZON_COGNITO_USER_POOLS
};

export default awsExports;
