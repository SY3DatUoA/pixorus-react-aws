#!/bin/bash
# ============================================================
#  PIXORUS — Deploy All 9 Lambda Functions to AWS
#
#  YOUR STACK VALUES (from CloudFormation outputs):
#    API URL:   https://50926csg2g.execute-api.us-east-2.amazonaws.com/prod
#    Region:    us-east-2
#    Stage:     prod
#    S3 Bucket: pixorus-prodv1-productimagesbucket-4cycikom36vx
#
#  HOW TO RUN:
#    1. Open terminal in the pixorus-aws/ folder
#    2. Run: bash deploy-lambdas.sh
# ============================================================

REGION="us-east-2"
STAGE="prod"
ERRORS=0

echo ""
echo "============================================"
echo "  PIXORUS Lambda Deployer"
echo "  Region: $REGION  |  Stage: $STAGE"
echo "============================================"
echo ""

deploy() {
  local FN=$1
  local ZIP="/tmp/pixorus-$FN.zip"
  local FUNC="pixorus-$FN-$STAGE"

  echo -n "  Deploying pixorus-$FN-$STAGE ... "

  if [ ! -f "backend/lambda/$FN/index.js" ]; then
    echo "SKIPPED (file missing)"
    return
  fi

  zip -j "$ZIP" "backend/lambda/$FN/index.js" > /dev/null 2>&1

  OUTPUT=$(aws lambda update-function-code \
    --function-name "$FUNC" \
    --zip-file "fileb://$ZIP" \
    --region "$REGION" \
    --output text 2>&1)

  if [ $? -eq 0 ]; then
    echo "✓"
  else
    echo "✗ FAILED"
    echo "    Error: $OUTPUT"
    ERRORS=$((ERRORS + 1))
  fi

  rm -f "$ZIP"
}

deploy getProducts
deploy addProduct
deploy updateProduct
deploy deleteProduct
deploy getCategories
deploy manageCategory
deploy placeOrder
deploy getOrders
deploy uploadImage

echo ""
echo "============================================"
if [ $ERRORS -eq 0 ]; then
  echo "  ✓ All 9 Lambdas deployed!"
  echo ""
  echo "  Verify your API is working:"
  echo "  curl https://50926csg2g.execute-api.us-east-2.amazonaws.com/prod/products"
  echo ""
  echo "  Expected: [] or a JSON array of products"
else
  echo "  ✗ $ERRORS function(s) failed — see errors above"
fi
echo "============================================"
echo ""
