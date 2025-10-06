# MindX Week 1 - Fullstack Application

**Production URL:** https://tulm.mindx.edu.vn  
**Status:** ✅ **LIVE & OPERATIONAL**

Complete fullstack application for MindX Engineer Onboarding Program Week 1.

## 🎯 Project Overview

A production-ready fullstack application demonstrating:

- **Backend**: Node.js/TypeScript Express API
- **Frontend**: React/TypeScript with Vite
- **Authentication**: Dual system (JWT + OpenID Connect)
- **Infrastructure**: Docker + Kubernetes (AKS)
- **Domain**: Custom domain with HTTPS (Let's Encrypt)
- **CI/CD Ready**: All manifests and configs included

**🌐 Live Demo:** https://tulm.mindx.edu.vn

## 📁 Project Structure

```
week1-fullstack-app/
├── api/                          # Backend API
│   ├── src/
│   │   ├── index.ts             # Main API server
│   │   └── middleware/          # Auth & DB placeholders
│   ├── Dockerfile               # Multi-stage build
│   ├── docker-compose.yml       # Local deployment
│   └── README.md                # API documentation
│
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── App.tsx              # Main component
│   │   └── App.css              # Styles
│   ├── Dockerfile               # Nginx production build
│   ├── nginx.conf               # Nginx configuration
│   └── README.md                # Frontend documentation
│
├── k8s-manifests/               # Kubernetes YAML files
│   ├── api-deployment.yaml      # API deployment
│   ├── frontend-deployment.yaml # Frontend deployment
│   ├── ingress.yaml             # Ingress routing
│   ├── cert-issuer.yaml         # SSL configuration
│   └── README.md                # Deployment guide
│
├── REQUEST_DEVOPS.md            # DevOps resource request
├── KUBERNETES_GUIDE.md          # K8s learning guide
└── README.md                    # This file
```

## 🚀 Quick Start

### Local Development

#### API (Port 3000)

```bash
cd api
npm install
npm run dev
```

#### Frontend (Port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open:

- Frontend: http://localhost:5173
- API: http://localhost:3000

### Docker (Local Testing)

#### Using Docker Compose

```bash
# Start both services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Individual Containers

```bash
# API (Port 3000)
cd api
docker build -t mindx-week1-api:latest .
docker run -d -p 3000:3000 mindx-week1-api:latest

# Frontend (Port 8080)
cd frontend
docker build -t mindx-week1-frontend:latest .
docker run -d -p 8080:80 mindx-week1-frontend:latest
```

## ☁️ Azure Deployment

### Step 1: Push to Azure Container Registry

```bash
# Login to ACR
az acr login --name <your-acr-name>

# Build and push API
cd api
docker build -t <your-acr-name>.azurecr.io/mindx-week1-api:latest .
docker push <your-acr-name>.azurecr.io/mindx-week1-api:latest

# Build and push Frontend
cd ../frontend
docker build -t <your-acr-name>.azurecr.io/mindx-week1-frontend:latest .
docker push <your-acr-name>.azurecr.io/mindx-week1-frontend:latest
```

### Step 2: Deploy to AKS

```bash
# Connect to AKS
az aks get-credentials --name <your-aks-name> --resource-group <your-rg-name>

# Update manifests
# Edit k8s-manifests/*.yaml and replace placeholders

# Deploy
kubectl apply -f k8s-manifests/api-deployment.yaml
kubectl apply -f k8s-manifests/frontend-deployment.yaml
kubectl apply -f k8s-manifests/ingress.yaml

# Check status
kubectl get all
kubectl get ingress
```

See [KUBERNETES_GUIDE.md](KUBERNETES_GUIDE.md) for detailed instructions.

## 📊 Architecture

### Local Development

```
┌─────────────┐         ┌─────────────┐
│  Frontend   │  HTTP   │     API     │
│   :5173     │────────▶│    :3000    │
│ (Vite Dev)  │         │  (Express)  │
└─────────────┘         └─────────────┘
```

### Docker Compose

```
┌─────────────┐         ┌─────────────┐
│  Frontend   │  HTTP   │     API     │
│   :8080     │────────▶│    :3000    │
│  (Nginx)    │         │  (Node.js)  │
└─────────────┘         └─────────────┘
```

### Kubernetes (AKS)

```
Internet (HTTPS)
    │
    ▼
┌─────────────────────────────────┐
│   Ingress (SSL Termination)     │
│   <your-domain>.mindx-dev.com   │
└─────────────────────────────────┘
    │                    │
    ▼                    ▼
┌─────────────┐    ┌─────────────┐
│  Frontend   │    │     API     │
│  Service    │    │   Service   │
│ (ClusterIP) │    │ (ClusterIP) │
└─────────────┘    └─────────────┘
    │                    │
    ▼                    ▼
┌─────────────┐    ┌─────────────┐
│  Frontend   │    │     API     │
│  Pods (x2)  │    │  Pods (x2)  │
│  (Nginx)    │    │  (Node.js)  │
└─────────────┘    └─────────────┘
```

## 📋 Features

### API Features

- ✅ TypeScript for type safety
- ✅ Express.js framework
- ✅ CORS enabled
- ✅ Health check endpoint
- ✅ Request logging
- ✅ Error handling
- ✅ Docker multi-stage build (140MB)
- ✅ Kubernetes health probes
- ✅ Auth middleware (ready for Step 5)
- ✅ Database abstraction (ready for Week 2-3)

### Frontend Features

- ✅ React 18 + TypeScript
- ✅ Vite for fast development
- ✅ Modern responsive UI
- ✅ API integration
- ✅ Health monitoring
- ✅ Docker with Nginx
- ✅ Production optimized
- ✅ Security headers

### Infrastructure Features

- ✅ Docker containerization
- ✅ Kubernetes manifests
- ✅ Ingress routing
- ✅ SSL/TLS with cert-manager
- ✅ Health checks & probes
- ✅ Resource limits
- ✅ Horizontal scaling ready
- ✅ Production-ready configuration

## ✅ Week 1 Progress Tracker

### Completed ✅

- [x] Step 1.1: Create Simple API
- [x] Step 1.2: Containerize API
- [x] Step 1.2: Test Docker locally
- [x] Step 4: Create React Frontend
- [x] Step 4: Containerize Frontend
- [x] Prepare K8s manifests
- [x] Create deployment documentation

### Pending (Requires DevOps) ⏸️

- [ ] Step 1.3: Setup ACR
- [ ] Step 1.4: Push to ACR
- [ ] Step 1.5: Deploy to Azure Web App (optional)
- [ ] Step 2: Deploy to AKS
- [ ] Step 3: Setup Ingress
- [ ] Step 5: Add Authentication
- [ ] Step 6: Setup HTTPS & Domain

## 📞 Getting Help

### Request Azure Resources

See [REQUEST_DEVOPS.md](REQUEST_DEVOPS.md) for template email to DevOps team.

### Learn Kubernetes

See [KUBERNETES_GUIDE.md](KUBERNETES_GUIDE.md) for comprehensive K8s tutorial.

### Documentation

- [API Documentation](api/README.md)
- [Frontend Documentation](frontend/README.md)
- [K8s Manifests Guide](k8s-manifests/README.md)

## 🎓 Learning Outcomes

After completing this project, you will understand:

- ✅ Building TypeScript applications (API & Frontend)
- ✅ Docker containerization & multi-stage builds
- ✅ Container orchestration with Kubernetes
- ✅ Ingress controllers & routing
- ✅ SSL/TLS certificates with cert-manager
- ✅ Azure cloud services (ACR, AKS)
- ✅ Production deployment practices
- ✅ Health checks & monitoring

## 🚀 Next Steps

1. **Immediate**: Test everything locally
2. **Day 1-2**: Request Azure resources from DevOps
3. **Day 3-4**: Push images to ACR
4. **Day 5-6**: Deploy to AKS
5. **Week 2**: Add monitoring & metrics
6. **Week 3**: Integrate AI capabilities
7. **Week 4**: Launch & iterate

## 📊 Tech Stack

| Layer                | Technology                   |
| -------------------- | ---------------------------- |
| **Frontend**         | React, TypeScript, Vite      |
| **Backend**          | Node.js, Express, TypeScript |
| **Containerization** | Docker, Docker Compose       |
| **Orchestration**    | Kubernetes (AKS)             |
| **Ingress**          | nginx-ingress                |
| **SSL**              | cert-manager + Let's Encrypt |
| **Cloud**            | Azure (ACR, AKS)             |
| **CI/CD**            | Ready for GitHub Actions     |

## 🏆 Success Criteria

- ✅ All applications run locally
- ✅ Docker containers work correctly
- ✅ API responds to requests
- ✅ Frontend communicates with API
- ✅ Ready to deploy to cloud
- ⏸️ Deployed to AKS (pending DevOps)
- ⏸️ HTTPS working (pending DNS)
- ⏸️ Production ready (pending deployment)

---

**Author**: MindX Engineer Onboarding Program  
**Week**: 1  
**Status**: Local Development Complete ✅ | Cloud Deployment Pending ⏸️  
**Last Updated**: September 30, 2025
