#!/usr/bin/bash
# Script to import existing Cloudflare resources into Terraform state
# This is needed when resources were created outside of Terraform

set -e

# Check required environment variables
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "Error: CLOUDFLARE_API_TOKEN environment variable is not set"
  exit 1
fi

if [ -z "$TF_VAR_cloudflare_account_id" ]; then
  echo "Error: TF_VAR_cloudflare_account_id environment variable is not set"
  exit 1
fi

ACCOUNT_ID="$TF_VAR_cloudflare_account_id"
PREFIX="arvid-tech-production"

cd "$(dirname "$0")/../terraform"

echo "Importing existing Cloudflare resources into Terraform state..."

# Import R2 buckets
echo "Importing R2 bucket: ${PREFIX}-assets"
terraform import cloudflare_r2_bucket.assets "${ACCOUNT_ID}/${PREFIX}-assets" || {
  echo "Warning: Failed to import assets bucket (may already be imported)"
}

echo "Importing R2 bucket: ${PREFIX}-incremental-cache"
terraform import cloudflare_r2_bucket.incremental_cache "${ACCOUNT_ID}/${PREFIX}-incremental-cache" || {
  echo "Warning: Failed to import incremental_cache bucket (may already be imported)"
}

# Get KV namespace ID
echo "Getting KV namespace ID for: ${PREFIX}-cache"
export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID"
KV_NAMESPACE_ID=$(node ../scripts/get-kv-namespace-id.ts "${PREFIX}-cache")

if [ -z "$KV_NAMESPACE_ID" ]; then
  echo "Error: Could not retrieve KV namespace ID"
  exit 1
fi

echo "Importing KV namespace: ${PREFIX}-cache (ID: ${KV_NAMESPACE_ID})"
terraform import cloudflare_workers_kv_namespace.cache "${ACCOUNT_ID}/${KV_NAMESPACE_ID}" || {
  echo "Warning: Failed to import KV namespace (may already be imported)"
}

echo ""
echo "Import complete! Run 'terraform plan' to verify the state is correct."
