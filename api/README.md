# MindX Week 1 - Simple TypeScript Express API

A production-ready Node.js/TypeScript Express API for MindX Engineer Onboarding Program.

## 📋 Features

- ✅ TypeScript for type safety
- ✅ Express.js web framework
- ✅ CORS enabled
- ✅ Environment variables with dotenv
- ✅ Health check endpoint
- ✅ Request logging
- ✅ Error handling
- ✅ Hot reload with nodemon

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The API will be available at: http://localhost:3000

## 📡 API Endpoints

### Health Check

```
GET /health
```

Returns server health status and uptime.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-09-30T07:48:00.000Z",
  "uptime": 123.45,
  "environment": "development"
}
```

### Root

```
GET /
```

Returns API information and available endpoints.

### API Test

```
GET /api
```

Simple API test endpoint.

### Hello with Name

```
GET /api/hello/:name
```

Returns personalized greeting.

**Example:**

```bash
curl http://localhost:3000/api/hello/MindX
```

**Response:**

```json
{
  "message": "Hello, MindX!",
  "timestamp": "2025-09-30T07:48:00.000Z"
}
```

## 🛠️ Scripts

```bash
# Development with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production build
npm run start

# Build and run
npm run start:dev
```

## 📁 Project Structure

```
api/
├── src/
│   └── index.ts          # Main application file
├── dist/                 # Compiled JavaScript (generated)
├── node_modules/         # Dependencies
├── .env                  # Environment variables (not in git)
├── .gitignore           # Git ignore rules
├── package.json         # Project configuration
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
API_VERSION=1.0.0
```

## 🐳 Next Steps

After verifying the API works locally:

1. **Containerize** (Step 1.2): Create Dockerfile
2. **Push to ACR** (Step 1.3-1.4): When Azure resources are ready
3. **Deploy to AKS** (Step 2+): Deploy to Kubernetes

## 📚 Tech Stack

- **Runtime**: Node.js v20+
- **Language**: TypeScript
- **Framework**: Express.js
- **CORS**: cors middleware
- **Environment**: dotenv

## 🐳 Docker

### Build Docker Image

```bash
docker build -t mindx-week1-api:latest .
```

### Run Container

```bash
# Run on port 3000
docker run -d -p 3000:3000 --name mindx-api mindx-week1-api:latest

# Check status
docker ps

# View logs
docker logs mindx-api

# Stop container
docker stop mindx-api

# Remove container
docker rm mindx-api
```

### Using Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Test Containerized API

```bash
# Health check
curl http://localhost:3000/health

# Test API
curl http://localhost:3000/api/hello/Docker
```

## 📊 Docker Image Details

- **Base Image**: node:20-alpine
- **Size**: ~140MB (optimized)
- **Multi-stage Build**: Yes
- **Non-root User**: Yes (nodejs:1001)
- **Health Check**: Enabled
- **Security**: Production-ready configuration

## ✅ Week 1 Progress

- [x] Step 1.1: Create Simple API ✅
- [x] Step 1.2: Containerize the API ✅
- [x] Step 1.2: Test locally with Docker ✅
- [ ] Step 1.3: Setup Azure Container Registry (need DevOps)
- [ ] Step 1.4: Build and Push to ACR (need DevOps)
- [ ] Step 1.5: Deploy to Azure Web App (optional)
- [ ] Step 2: Deploy to AKS

## 🚀 Next Steps

**Ready for Azure deployment when DevOps provides:**

1. Azure Container Registry (ACR) name and credentials
2. AKS cluster name and resource group

**Commands ready to use (when ACR is available):**

```bash
# Login to ACR
az acr login --name <your-acr-name>

# Tag image for ACR
docker tag mindx-week1-api:latest <your-acr-name>.azurecr.io/mindx-week1-api:latest

# Push to ACR
docker push <your-acr-name>.azurecr.io/mindx-week1-api:latest
```

---

**Author**: MindX Engineer Onboarding  
**Week**: 1  
**Last Updated**: 2025-09-30
