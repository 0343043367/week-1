# MindX Week 1 - Fullstack Application

**Production URL:** https://tulm.mindx.edu.vn  
**Status:** ✅ **ĐANG HOẠT ĐỘNG**

Ứng dụng fullstack hoàn chỉnh cho chương trình MindX Engineer Onboarding - Tuần 1.

## 🎯 Tổng Quan Dự Án

Ứng dụng fullstack production-ready bao gồm:

- **Backend**: Node.js/TypeScript Express API
- **Frontend**: React/TypeScript với Vite
- **Authentication**: Hệ thống xác thực kép (JWT + OpenID Connect với MindX ID)
- **Infrastructure**: Docker + Kubernetes (Azure AKS)
- **Domain**: HTTPS với Let's Encrypt
- **Deployment**: Thủ công lên Azure AKS

**🌐 Demo:** https://tulm.mindx.edu.vn

## 📁 Cấu Trúc Dự Án

```
week1-fullstack-app/
├── api/                          # Backend API
│   ├── src/
│   │   ├── index.ts             # Server chính với authentication
│   │   └── middleware/          # JWT auth & database middleware
│   ├── Dockerfile               # Multi-stage Docker build
│   ├── docker-compose.yml       # Local development
│   └── README.md                # API documentation
│
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── components/          # Login, Register, Dashboard, OpenID
│   │   ├── contexts/            # AuthContext quản lý authentication
│   │   ├── App.tsx              # Main component
│   │   └── main.tsx             # Entry point
│   ├── Dockerfile               # Nginx production build
│   ├── nginx.conf               # Nginx configuration
│   └── README.md                # Frontend documentation
│
├── k8s-manifests/               # Kubernetes deployment files
│   ├── api-deployment.yaml      # API deployment & service
│   ├── frontend-deployment.yaml # Frontend deployment & service
│   ├── ingress.yaml             # Ingress với SSL/TLS
│   ├── cert-issuer.yaml         # Let's Encrypt issuer
│   └── README.md                # Hướng dẫn deployment
│
└── README.md                    # File này
```

## 🚀 Chạy Dự Án

### Development (Local)

#### 1. Backend API (Port 3000)

```bash
cd api
npm install
npm run dev
```

#### 2. Frontend (Port 5173)

```bash
cd frontend
npm install
npm run dev
```

Truy cập:

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000
- **API Health**: http://localhost:3000/health

### Docker (Test trên Local)

#### Option 1: Docker Compose (Khuyên dùng)

```bash
# Khởi động cả API và Frontend
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down
```

#### Option 2: Build riêng từng container

```bash
# Build và chạy API (Port 3000)
cd api
docker build -t mindx-week1-api:latest .
docker run -d -p 3000:3000 mindx-week1-api:latest

# Build và chạy Frontend (Port 8080)
cd frontend
docker build -t mindx-week1-frontend:latest .
docker run -d -p 8080:80 mindx-week1-frontend:latest
```

## ☁️ Deployment lên Azure (Thủ Công)

### Bước 1: Build và Push Images lên Azure Container Registry

```bash
# Login vào ACR
az acr login --name <your-acr-name>

# Build và push API image
cd api
docker build -t <your-acr-name>.azurecr.io/mindx-week1-api:latest .
docker push <your-acr-name>.azurecr.io/mindx-week1-api:latest

# Build và push Frontend image
cd ../frontend
docker build -t <your-acr-name>.azurecr.io/mindx-week1-frontend:latest .
docker push <your-acr-name>.azurecr.io/mindx-week1-frontend:latest
```

### Bước 2: Deploy lên AKS

```bash
# Kết nối với AKS cluster
az aks get-credentials --name <aks-cluster-name> --resource-group <resource-group>

# Verify kết nối
kubectl get nodes

# Deploy các components (theo thứ tự)
kubectl apply -f k8s-manifests/api-deployment.yaml
kubectl apply -f k8s-manifests/frontend-deployment.yaml
kubectl apply -f k8s-manifests/cert-issuer.yaml
kubectl apply -f k8s-manifests/ingress.yaml

# Kiểm tra trạng thái deployment
kubectl get all
kubectl get ingress
kubectl get certificate
```

### Bước 3: Cập nhật khi có thay đổi

```bash
# Rebuild và push image mới
docker build -t <your-acr-name>.azurecr.io/mindx-week1-api:latest .
docker push <your-acr-name>.azurecr.io/mindx-week1-api:latest

# Restart deployment để pull image mới
kubectl rollout restart deployment/mindx-week1-api
kubectl rollout restart deployment/mindx-week1-frontend

# Theo dõi quá trình update
kubectl rollout status deployment/mindx-week1-api
```

**Lưu ý:** Deployment này được thực hiện hoàn toàn thủ công, không sử dụng CI/CD pipeline.

## 📊 Kiến Trúc Hệ Thống

### Local Development

```
┌─────────────┐         ┌─────────────────────┐
│  Frontend   │  HTTP   │        API          │
│   :5173     │────────▶│       :3000         │
│ (Vite Dev)  │         │  JWT + OpenID Auth  │
└─────────────┘         └─────────────────────┘
```

### Production (Azure AKS)

```
                    Internet (HTTPS)
                           │
                           ▼
        ┌──────────────────────────────────┐
        │   Nginx Ingress Controller       │
        │   SSL/TLS (Let's Encrypt)        │
        │   tulm.mindx.edu.vn              │
        └──────────────────────────────────┘
                 │                │
        /        │                │         /api/*
                 ▼                ▼
    ┌──────────────────┐    ┌──────────────────┐
    │  Frontend        │    │  API             │
    │  Service         │    │  Service         │
    │  (ClusterIP)     │    │  (ClusterIP)     │
    └──────────────────┘    └──────────────────┘
                 │                │
                 ▼                ▼
    ┌──────────────────┐    ┌──────────────────┐
    │  Frontend Pods   │    │  API Pods        │
    │  (Nginx)         │    │  (Node.js)       │
    │  Replicas: 2     │    │  Replicas: 2     │
    └──────────────────┘    └──────────────────┘
```

## 📋 Tính Năng

### Backend API

- ✅ **TypeScript** với Express.js
- ✅ **Authentication hai cấp độ:**
  - JWT Authentication (Register/Login cổ điển)
  - OpenID Connect với MindX ID (SSO)
- ✅ **Protected Routes** với JWT middleware
- ✅ **Password Hashing** với bcrypt
- ✅ CORS enabled
- ✅ Request logging
- ✅ Error handling
- ✅ Health check endpoint
- ✅ Docker multi-stage build (~140MB)

### Frontend

- ✅ **React 18 + TypeScript** với Vite
- ✅ **Dual Authentication UI:**
  - Login/Register form (JWT)
  - "Login với MindX ID" button (OpenID Connect)
- ✅ **AuthContext** quản lý authentication state
- ✅ **Protected Routes** - Dashboard chỉ hiện khi đã login
- ✅ **Token Management** - Auto-save/load từ localStorage
- ✅ Modern responsive UI
- ✅ Docker với Nginx (production-optimized)

### Infrastructure

- ✅ **Docker containerization** - Multi-stage builds
- ✅ **Kubernetes (AKS)** - Production deployment
- ✅ **Nginx Ingress** - SSL/TLS termination
- ✅ **Let's Encrypt** - Tự động renew certificates
- ✅ **Health checks & probes** - Liveness & readiness
- ✅ **Horizontal scaling** - Multiple replicas
- ✅ **Custom domain** với HTTPS

## ✅ Tiến Độ Hoàn Thành

### Đã Hoàn Thành ✅

- [x] **Backend API** - Express.js + TypeScript
- [x] **Frontend** - React + TypeScript + Vite
- [x] **Authentication System** - JWT + OpenID Connect với MindX ID
- [x] **Docker Containers** - Multi-stage builds cho cả API và Frontend
- [x] **Kubernetes Manifests** - Deployments, Services, Ingress
- [x] **Azure Deployment** - Deploy lên AKS
- [x] **SSL/TLS** - Let's Encrypt certificates
- [x] **Custom Domain** - tulm.mindx.edu.vn
- [x] **Production Ready** - Đang chạy ổn định trên production

### Tech Stack đã áp dụng

| Component            | Technology                      |
| -------------------- | ------------------------------- |
| **Backend**          | Node.js, Express, TypeScript    |
| **Frontend**         | React 18, TypeScript, Vite      |
| **Authentication**   | JWT, bcrypt, OpenID Connect     |
| **Containerization** | Docker, Multi-stage builds      |
| **Orchestration**    | Kubernetes (Azure AKS)          |
| **Ingress**          | Nginx Ingress Controller        |
| **SSL/TLS**          | cert-manager + Let's Encrypt    |
| **Cloud**            | Azure (AKS, Container Registry) |
| **Deployment**       | Manual (kubectl)                |

## 📚 Tài Liệu Tham Khảo

- [API Documentation](api/README.md) - Chi tiết về backend API endpoints
- [Frontend Documentation](frontend/README.md) - Hướng dẫn về React frontend
- [K8s Manifests Guide](k8s-manifests/README.md) - Kubernetes deployment manifests

## 🎓 Kiến Thức Đạt Được

Sau khi hoàn thành dự án này, bạn đã nắm được:

- ✅ Xây dựng ứng dụng TypeScript (API & Frontend)
- ✅ Authentication với JWT và OpenID Connect
- ✅ Docker containerization & multi-stage builds
- ✅ Container orchestration với Kubernetes
- ✅ Nginx Ingress controllers & routing
- ✅ SSL/TLS certificates với cert-manager
- ✅ Azure cloud services (ACR, AKS)
- ✅ Production deployment thủ công
- ✅ Health checks & monitoring

## 🏆 Kết Quả Đạt Được

- ✅ Ứng dụng chạy tốt trên local
- ✅ Docker containers hoạt động chính xác
- ✅ API response đầy đủ các endpoints
- ✅ Frontend tương tác với API
- ✅ Authentication system hoàn chỉnh (JWT + OpenID)
- ✅ **Deployed thành công lên Azure AKS**
- ✅ **HTTPS hoạt động với Let's Encrypt**
- ✅ **Production ready và đang chạy ổn định**
- ✅ **Custom domain: tulm.mindx.edu.vn**

---

**Author**: Lê Minh Tú - MindX Engineer Onboarding Program  
**Week**: 1  
**Status**: ✅ **HOÀN THÀNH & PRODUCTION READY**  
**Last Updated**: October 6, 2025
