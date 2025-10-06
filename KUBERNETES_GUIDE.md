# Kubernetes Learning Guide for Week 1

## 📚 What is Kubernetes?

Kubernetes (K8s) is an open-source container orchestration platform that automates deploying, scaling, and managing containerized applications.

### Key Concepts to Understand

#### 1. **Pod**

- Smallest deployable unit in Kubernetes
- Contains one or more containers
- Shares network and storage
- Ephemeral (can be replaced)

#### 2. **Deployment**

- Manages ReplicaSets and Pods
- Ensures desired number of replicas
- Handles rolling updates
- Provides self-healing

#### 3. **Service**

- Stable endpoint for Pods
- Load balances traffic
- Types: ClusterIP, NodePort, LoadBalancer
- Uses selectors to find Pods

#### 4. **Ingress**

- HTTP(S) routing to services
- Single entry point
- Handles SSL termination
- Path-based and host-based routing

#### 5. **Namespace**

- Virtual clusters within Kubernetes
- Resource isolation
- Access control boundaries

---

## 🎯 Our Architecture (Week 1)

```
Internet
    │
    ▼
┌─────────────────────────────────┐
│   Ingress Controller (nginx)    │
│   - SSL Termination             │
│   - Path Routing                │
└─────────────────────────────────┘
    │              │
    ▼              ▼
┌─────────────┐  ┌─────────────┐
│  Frontend   │  │    API      │
│  Service    │  │  Service    │
│ (ClusterIP) │  │ (ClusterIP) │
└─────────────┘  └─────────────┘
    │              │
    ▼              ▼
┌─────────────┐  ┌─────────────┐
│  Frontend   │  │    API      │
│  Pods (x2)  │  │  Pods (x2)  │
│  (Nginx)    │  │  (Node.js)  │
└─────────────┘  └─────────────┘
```

---

## 📖 Step-by-Step Deployment Guide

### Step 1: Prepare Docker Images

```bash
# Build API image
cd api
docker build -t mindx-week1-api:latest .

# Build Frontend image
cd ../frontend
docker build -t mindx-week1-frontend:latest .
```

### Step 2: Push to Azure Container Registry

```bash
# Login to ACR
az acr login --name <your-acr-name>

# Tag images
docker tag mindx-week1-api:latest <your-acr-name>.azurecr.io/mindx-week1-api:latest
docker tag mindx-week1-frontend:latest <your-acr-name>.azurecr.io/mindx-week1-frontend:latest

# Push images
docker push <your-acr-name>.azurecr.io/mindx-week1-api:latest
docker push <your-acr-name>.azurecr.io/mindx-week1-frontend:latest
```

### Step 3: Connect to AKS

```bash
# Get AKS credentials
az aks get-credentials --name <your-aks-name> --resource-group <your-rg-name>

# Verify connection
kubectl cluster-info
kubectl get nodes
```

### Step 4: Update Manifests

Edit `k8s-manifests/*.yaml` files:

- Replace `<your-acr-name>` with actual ACR name
- Replace `<your-domain>` with actual domain

### Step 5: Deploy API

```bash
# Apply API deployment and service
kubectl apply -f k8s-manifests/api-deployment.yaml

# Check status
kubectl get deployments
kubectl get pods -l app=mindx-api
kubectl get services

# View logs
kubectl logs -l app=mindx-api --tail=50
```

### Step 6: Deploy Frontend

```bash
# Apply Frontend deployment and service
kubectl apply -f k8s-manifests/frontend-deployment.yaml

# Check status
kubectl get pods -l app=mindx-frontend
```

### Step 7: Install Ingress Controller

```bash
# Add nginx-ingress helm repo
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Install nginx-ingress
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.replicaCount=2

# Wait for external IP
kubectl get svc -n ingress-nginx --watch
```

### Step 8: Deploy Ingress

```bash
# Apply ingress configuration
kubectl apply -f k8s-manifests/ingress.yaml

# Check ingress
kubectl get ingress
kubectl describe ingress mindx-ingress
```

### Step 9: Configure DNS

```bash
# Get ingress external IP
kubectl get ingress mindx-ingress

# Update DNS A record
# <your-domain>.mindx-dev.com → <EXTERNAL-IP>
```

### Step 10: Setup SSL with cert-manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f k8s-manifests/cert-issuer.yaml

# Cert-manager will automatically provision SSL
# Check certificate status
kubectl get certificates
kubectl describe certificate mindx-tls-secret
```

---

## 🔍 Useful Kubernetes Commands

### Viewing Resources

```bash
# Get all resources
kubectl get all

# Get specific resources
kubectl get pods
kubectl get deployments
kubectl get services
kubectl get ingress

# Watch resources in real-time
kubectl get pods --watch

# Detailed information
kubectl describe pod <pod-name>
kubectl describe deployment <deployment-name>
```

### Debugging

```bash
# View logs
kubectl logs <pod-name>
kubectl logs -f <pod-name>  # Follow logs
kubectl logs -l app=mindx-api --tail=100

# Execute commands in pod
kubectl exec -it <pod-name> -- sh
kubectl exec -it <pod-name> -- env

# Port forwarding (for testing)
kubectl port-forward pod/<pod-name> 8080:3000
kubectl port-forward service/mindx-api-service 3000:3000
```

### Updating & Rollback

```bash
# Update deployment
kubectl set image deployment/mindx-api api=<new-image>
kubectl rollout status deployment/mindx-api

# Rollback
kubectl rollout undo deployment/mindx-api
kubectl rollout history deployment/mindx-api
```

### Scaling

```bash
# Scale deployment
kubectl scale deployment/mindx-api --replicas=3

# Autoscaling
kubectl autoscale deployment/mindx-api --min=2 --max=5 --cpu-percent=80
```

### Cleanup

```bash
# Delete specific resources
kubectl delete -f k8s-manifests/api-deployment.yaml

# Delete by label
kubectl delete pods -l app=mindx-api

# Delete everything in namespace
kubectl delete all --all -n default
```

---

## 🎓 Learning Resources

### Official Documentation

- [Kubernetes Docs](https://kubernetes.io/docs/)
- [Azure AKS Docs](https://docs.microsoft.com/azure/aks/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

### Interactive Learning

- [Kubernetes Playground](https://www.katacoda.com/courses/kubernetes)
- [Play with Kubernetes](https://labs.play-with-k8s.com/)

### Video Tutorials

- [Kubernetes Crash Course](https://www.youtube.com/watch?v=X48VuDVv0do)
- [AKS Tutorial](https://www.youtube.com/watch?v=4ht22ReBjno)

### Books

- "Kubernetes in Action" by Marko Luksa
- "Kubernetes Up & Running" by Kelsey Hightower

---

## 🐛 Common Issues & Solutions

### Issue 1: ImagePullBackOff

**Problem:** Pod can't pull image from ACR

**Solution:**

```bash
# Attach ACR to AKS
az aks update --name <aks-name> --resource-group <rg-name> --attach-acr <acr-name>

# Verify
kubectl get pods
```

### Issue 2: CrashLoopBackOff

**Problem:** Container keeps crashing

**Solution:**

```bash
# Check logs
kubectl logs <pod-name>

# Check pod events
kubectl describe pod <pod-name>

# Common fixes:
# - Fix application code
# - Check environment variables
# - Verify health check endpoints
```

### Issue 3: Service not accessible

**Problem:** Can't reach service

**Solution:**

```bash
# Check service
kubectl get svc
kubectl describe svc <service-name>

# Test from within cluster
kubectl run test --image=busybox --rm -it -- wget -O- http://mindx-api-service:3000/health

# Check endpoints
kubectl get endpoints
```

### Issue 4: SSL Certificate not issued

**Problem:** cert-manager not creating certificate

**Solution:**

```bash
# Check cert-manager
kubectl get pods -n cert-manager

# Check certificate status
kubectl describe certificate mindx-tls-secret

# Check challenge
kubectl get challenges

# View cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager
```

---

## ✅ Week 1 Kubernetes Checklist

- [ ] Understand basic Kubernetes concepts
- [ ] Install and configure kubectl
- [ ] Connect to AKS cluster
- [ ] Deploy API to AKS
- [ ] Deploy Frontend to AKS
- [ ] Install and configure Ingress
- [ ] Setup SSL with cert-manager
- [ ] Configure custom domain
- [ ] Test complete application
- [ ] Monitor with kubectl commands

---

**Author:** MindX Engineer Onboarding  
**Week:** 1  
**Last Updated:** 2025-09-30
