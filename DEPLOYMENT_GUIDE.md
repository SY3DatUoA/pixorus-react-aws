# PIXORUS React — Complete AWS Deployment Guide

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         AWS CLOUD                                │
│                                                                  │
│   ┌─────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│   │  AWS Amplify│    │  API Gateway │    │    DynamoDB       │  │
│   │  (React App)│───▶│  REST API    │───▶│  - Products       │  │
│   │             │    │              │    │  - Categories     │  │
│   └─────────────┘    └──────┬───────┘    │  - Orders         │  │
│                             │            │  - Counters       │  │
│   ┌─────────────┐    ┌──────▼───────┐    └──────────────────┘  │
│   │   Cognito   │    │   Lambda     │                          │
│   │  User Pool  │    │  Functions   │    ┌──────────────────┐  │
│   │ (Admin Auth)│    │  (9 total)   │───▶│   S3 Bucket      │  │
│   └─────────────┘    └─────────────┘    │  (Product Images) │  │
│                                         └──────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured (`aws configure`)
- Node.js 18+ installed
- Git installed

---

## STEP 1 — Deploy Backend Infrastructure (CloudFormation)

This deploys DynamoDB tables, Lambda functions, API Gateway, Cognito, and S3 in one command.

```bash
# Deploy with default settings (no custom domain)
aws cloudformation deploy \
  --template-file infrastructure/cloudformation.yaml \
  --stack-name pixorus-store-prod \
  --parameter-overrides \
    Stage=prod \
    AdminEmail=your@email.com \
    CognitoAdminEmail=your@email.com \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1

# Optional: Deploy with custom domain
aws cloudformation deploy \
  --template-file infrastructure/cloudformation.yaml \
  --stack-name pixorus-store-prod \
  --parameter-overrides \
    Stage=prod \
    DomainName=yourstore.com \
    HostedZoneId=Z1234567890 \
    CertificateArn=arn:aws:acm:us-east-1:... \
    AdminEmail=your@email.com \
    CognitoAdminEmail=your@email.com \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

### Get Stack Outputs

After deployment, note these values (you'll need them for Step 3):

```bash
aws cloudformation describe-stacks \
  --stack-name pixorus-store-prod \
  --query 'Stacks[0].Outputs' \
  --output table
```

Key outputs:
- **ApiUrl** → your API Gateway URL
- **UserPoolId** → Cognito User Pool ID
- **UserPoolClientId** → Cognito App Client ID
- **IdentityPoolId** → Cognito Identity Pool ID
- **ImagesBucketName** → S3 bucket name for product images

---

## STEP 2 — Deploy Lambda Function Code

The CloudFormation template creates placeholder Lambda functions. Deploy the real code:

### Mac / Linux:
```bash
chmod +x deploy-lambdas.sh
./deploy-lambdas.sh prod us-east-1
```

### Windows (PowerShell):
```powershell
.\deploy-lambdas.ps1 prod us-east-1
```

This script zips and uploads all 9 Lambda functions:
- getProducts, addProduct, updateProduct, deleteProduct
- getCategories, manageCategory
- placeOrder, getOrders
- uploadImage

---

## STEP 3 — Configure Frontend (aws-exports.js)

Edit `src/aws-exports.js` with values from Step 1 outputs:

```javascript
const awsExports = {
  aws_project_region: "us-east-1",

  // Cognito User Pool (from stack outputs)
  aws_cognito_region: "us-east-1",
  aws_user_pools_id: "us-east-1_XXXXXXXXX",           // UserPoolId output
  aws_user_pools_web_client_id: "XXXXXXXXXXXXXXXXX",   // UserPoolClientId output
  aws_cognito_identity_pool_id: "us-east-1:xxxx-...",  // IdentityPoolId output

  // API Gateway (ApiUrl output)
  aws_cloud_logic_custom: [{
    name: "PixorusAPI",
    endpoint: "https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/prod",
    region: "us-east-1",
  }],

  // S3 Images (ImagesBucketName output)
  aws_user_files_s3_bucket: "your-actual-bucket-name",
  aws_user_files_s3_bucket_region: "us-east-1",
};
export default awsExports;
```

---

## STEP 4 — Create Admin User in Cognito

Admin accounts are managed through AWS Cognito (not the app). Create the first admin:

```bash
# Create admin user
aws cognito-idp admin-create-user \
  --user-pool-id us-east-1_XXXXXXXXX \
  --username admin@yourstore.com \
  --temporary-password "TempPass123!" \
  --user-attributes Name=email,Value=admin@yourstore.com \
  --region us-east-1

# Set permanent password (skip forced reset)
aws cognito-idp admin-set-user-password \
  --user-pool-id us-east-1_XXXXXXXXX \
  --username admin@yourstore.com \
  --password "YourSecurePassword123!" \
  --permanent \
  --region us-east-1
```

**Admin Login Credentials:**
- Email: `admin@yourstore.com`
- Password: `YourSecurePassword123!`

---

## STEP 5 — Seed Initial Data (Optional)

```bash
# Set the API URL first
export API_URL="https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/prod"

# Run the seed script
node infrastructure/seed.js
```

---

## STEP 6 — Deploy Frontend to AWS Amplify

### Option A: Amplify Console (Recommended)

1. Push your code to GitHub/GitLab/CodeCommit
2. Go to **AWS Amplify Console** → "New App" → "Host web app"
3. Connect your repository
4. Amplify auto-detects the `amplify.yml` build config
5. Add environment variables if needed
6. Deploy!

### Option B: Amplify CLI

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize (in project root)
amplify init

# Add hosting
amplify add hosting
# Choose: Amazon CloudFront and S3

# Deploy
amplify publish
```

### Option C: Manual Build + S3 + CloudFront

```bash
# Build the React app
npm run build

# Create S3 bucket for hosting
aws s3 mb s3://pixorus-frontend-prod

# Upload build
aws s3 sync build/ s3://pixorus-frontend-prod --delete

# Enable static website hosting
aws s3 website s3://pixorus-frontend-prod \
  --index-document index.html \
  --error-document index.html
```

---

## Project Structure

```
pixorus-react/
├── src/
│   ├── pages/
│   │   ├── LandingPage.js     # Entry: Customer Login / Admin Login
│   │   ├── StorePage.js       # Customer storefront with cart
│   │   └── AdminPage.js       # Full admin panel with Cognito auth
│   ├── context/
│   │   ├── ThemeContext.js    # Global theme/customization state
│   │   └── CartContext.js     # Shopping cart state
│   ├── services/
│   │   └── api.js             # All API Gateway calls (with Cognito JWT)
│   ├── components/
│   │   └── Toast.js           # Notification component
│   ├── aws-exports.js         # ← EDIT THIS with your AWS values
│   ├── App.js                 # Router
│   └── index.js               # Entry point
├── backend/
│   └── lambda/
│       ├── getProducts/       # GET /products
│       ├── addProduct/        # POST /products (Cognito protected)
│       ├── updateProduct/     # PUT /products/{id} (Cognito protected)
│       ├── deleteProduct/     # DELETE /products/{id} (Cognito protected)
│       ├── getCategories/     # GET /categories
│       ├── manageCategory/    # POST/PUT/DELETE /categories (protected)
│       ├── placeOrder/        # POST /orders (public)
│       ├── getOrders/         # GET /orders (Cognito protected)
│       └── uploadImage/       # POST /upload-url (S3 presigned URL)
├── infrastructure/
│   ├── cloudformation.yaml    # Full AWS stack definition
│   └── seed.js                # Optional: seed default products
├── amplify.yml                # AWS Amplify build configuration
├── deploy-lambdas.sh          # Mac/Linux Lambda deployment script
└── deploy-lambdas.ps1         # Windows Lambda deployment script
```

---

## Features

### Customer Store (`/#store`)
- Browse products with search, category filter, price range
- Sort by price, name, rating
- Quick view modal with product details
- Shopping cart with quantity controls
- Wishlist (heart icon)
- Checkout → places order via API

### Admin Panel (`/#admin`)
- **Login**: AWS Cognito email + password (no default password!)
- **Dashboard**: Stats (products, orders, revenue, items sold)
- **Products**: Full CRUD + image upload to S3 + hide/show toggle
- **Categories**: Add/edit/delete categories with Font Awesome icons
- **Orders**: View all placed orders with item details
- **Analytics**: Sales data per product (units sold + revenue)
- **Customize**: Live theme editor — colors, fonts, text, border radius

### Theme Customization
Every visual element is customizable via the admin panel:
- Accent color, background, surface colors, border colors
- Body font and display font
- Border radius (small/medium/large/xl)
- Store name, promo banner text, hero title and subtitle

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /products | Public | List all products |
| POST | /products | Cognito | Add product |
| PUT | /products/{id} | Cognito | Update product |
| DELETE | /products/{id} | Cognito | Delete product |
| GET | /categories | Public | List categories |
| POST | /categories | Cognito | Add category |
| PUT | /categories/{id} | Cognito | Update category |
| DELETE | /categories/{id} | Cognito | Delete category |
| POST | /orders | Public | Place order |
| GET | /orders | Cognito | List all orders |
| POST | /upload-url | Cognito | Get S3 presigned upload URL |

---

## Cost Estimate (AWS Free Tier)

For a small-to-medium store:
- **DynamoDB**: Free tier covers 25GB storage + 200M requests/month
- **Lambda**: Free tier covers 1M requests + 400K GB-seconds/month
- **API Gateway**: $3.50 per million API calls
- **S3**: $0.023 per GB storage
- **Cognito**: Free for up to 50,000 MAUs
- **Amplify Hosting**: Pay per build minute + GB served

Estimated monthly cost for low traffic: **$0–$5/month**

---

## Troubleshooting

**CORS errors**: Ensure CloudFormation deployed the CORS headers in Lambda functions (they're included by default in all handlers).

**Auth 401 errors**: The Cognito JWT token expires after 1 hour. The app auto-refreshes via `fetchAuthSession()`. If you see 401s, try logging out and back in.

**S3 upload fails**: Check that the `IMAGES_BUCKET` environment variable is set on the `uploadImage` Lambda function.

**Products not loading**: Check `aws-exports.js` has the correct `ApiUrl` from CloudFormation outputs.
