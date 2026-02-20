// ─────────────────────────────────────────────────────────────────────────────
// aws-exports.js  — Generated after running CloudFormation / amplify init
// Replace ALL placeholder values with your actual AWS output values.
// These values come from the CloudFormation stack Outputs tab.
// ─────────────────────────────────────────────────────────────────────────────

const awsExports = {
  // ── Region ──────────────────────────────────────────────────────────────────
  aws_project_region: "us-east-1",                  // ← your AWS region

  // ── Cognito User Pool (Admin Auth) ──────────────────────────────────────────
  aws_cognito_region: "us-east-1",
  aws_user_pools_id: "us-east-1_XXXXXXXXX",         // ← UserPoolId output
  aws_user_pools_web_client_id: "XXXXXXXXXXXXXXXXX", // ← UserPoolClientId output

  // ── Cognito Identity Pool ────────────────────────────────────────────────────
  aws_cognito_identity_pool_id: "us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // ← IdentityPoolId

  // ── API Gateway ──────────────────────────────────────────────────────────────
  // After deploying CloudFormation, get the ApiUrl output value and paste it here
  aws_cloud_logic_custom: [
    {
      name: "PixorusAPI",
      endpoint: "https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/prod", // ← ApiUrl output
      region: "us-east-1",
    },
  ],

  // ── S3 (Product Images) ──────────────────────────────────────────────────────
  aws_user_files_s3_bucket: "pixorus-images-prod-XXXXXXXXXXXX", // ← ImagesBucketName output
  aws_user_files_s3_bucket_region: "us-east-1",

  // ── Auth type for API calls ──────────────────────────────────────────────────
  // Public endpoints (GET products, GET categories, POST orders) → NONE
  // Admin endpoints (POST/PUT/DELETE products, categories, GET orders) → AMAZON_COGNITO_USER_POOLS
};

export default awsExports;
