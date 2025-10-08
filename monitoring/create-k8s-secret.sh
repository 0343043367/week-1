#!/bin/bash

# Script to create Kubernetes secret for Application Insights
# Usage: ./create-k8s-secret.sh

echo "🔐 Creating Kubernetes Secret for Application Insights"
echo "======================================================"
echo ""

# Check if connection string is provided as argument or prompt for it
if [ -z "$1" ]; then
  echo "Please enter your Application Insights Connection String:"
  echo "(Format: InstrumentationKey=xxx;IngestionEndpoint=xxx;LiveEndpoint=xxx)"
  read -r CONNECTION_STRING
else
  CONNECTION_STRING="$1"
fi

# Validate connection string
if [ -z "$CONNECTION_STRING" ]; then
  echo "❌ Error: Connection string cannot be empty"
  exit 1
fi

if [[ ! "$CONNECTION_STRING" =~ "InstrumentationKey=" ]]; then
  echo "❌ Error: Connection string format appears invalid"
  echo "Expected format: InstrumentationKey=xxx;IngestionEndpoint=xxx;LiveEndpoint=xxx"
  exit 1
fi

# Create the secret
echo ""
echo "Creating secret 'app-insights-secret' in default namespace..."
kubectl create secret generic app-insights-secret \
  --from-literal=connection-string="$CONNECTION_STRING" \
  --namespace default \
  --dry-run=client -o yaml | kubectl apply -f -

if [ $? -eq 0 ]; then
  echo "✅ Secret created successfully!"
  echo ""
  echo "Verify with:"
  echo "  kubectl get secret app-insights-secret"
  echo ""
  echo "View (base64 encoded):"
  echo "  kubectl get secret app-insights-secret -o yaml"
  echo ""
  echo "Decode to verify:"
  echo "  kubectl get secret app-insights-secret -o jsonpath='{.data.connection-string}' | base64 -d"
else
  echo "❌ Failed to create secret"
  exit 1
fi

