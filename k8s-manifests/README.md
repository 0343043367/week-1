# Kubernetes Manifests for Week 1

This directory contains all Kubernetes YAML files needed to deploy the fullstack application to AKS.

## 📁 Files

- `api-deployment.yaml` - API Deployment and Service
- `frontend-deployment.yaml` - Frontend Deployment and Service
- `ingress.yaml` - Ingress routing configuration
- `cert-issuer.yaml` - cert-manager ClusterIssuer for SSL

## 🚀 Quick Deploy

### Prerequisites

1. AKS cluster running
2. kubectl configured
3. Images pushed to ACR
4. nginx-ingress installed
5. cert-manager installed (for SSL)

### Deploy Steps

```bash
# 1. Update placeholders in YAML files
# Replace <your-acr-name> and <your-domain>

# 2. Deploy API
kubectl apply -f api-deployment.yaml

# 3. Deploy Frontend
kubectl apply -f frontend-deployment.yaml

# 4. Setup cert-manager (if not installed)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# 5. Create ClusterIssuer
kubectl apply -f cert-issuer.yaml

# 6. Deploy Ingress
kubectl apply -f ingress.yaml

# 7. Check status
kubectl get all
kubectl get ingress
kubectl get certificates
```

## 🔍 Verify Deployment

```bash
# Check pods
kubectl get pods

# Check services
kubectl get svc

# Check ingress
kubectl get ingress

# View logs
kubectl logs -l app=mindx-api
kubectl logs -l app=mindx-frontend
```

## 🌐 Access Application

After DNS is configured and SSL certificate is issued:

```
https://<your-domain>.mindx-dev.com/
https://<your-domain>.mindx-dev.com/health
https://<your-domain>.mindx-dev.com/api
```

## 📝 Customization

Before deploying, update these placeholders:

1. **In all deployment files:**

   - `<your-acr-name>` → Your actual ACR name

2. **In ingress.yaml:**

   - `<your-domain>` → Your subdomain

3. **In cert-issuer.yaml:**
   - `your-email@mindx.com.vn` → Your actual email

---

**Author:** MindX Engineer Onboarding  
**Week:** 1
