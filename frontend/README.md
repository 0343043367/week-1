# MindX Week 1 - React Frontend

Modern React + TypeScript + Vite frontend for MindX Engineer Onboarding Program.

## 📋 Features

- ✅ React 18 with TypeScript
- ✅ Vite for fast development
- ✅ API integration with backend
- ✅ Health check monitoring
- ✅ Beautiful modern UI
- ✅ Docker ready with Nginx
- ✅ Responsive design

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:5173

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔌 API Integration

The frontend connects to the backend API:

- Default: `http://localhost:3000`
- Configurable via UI

Make sure the API is running before starting frontend.

## 🐳 Docker

### Build Image

```bash
docker build -t mindx-week1-frontend:latest .
```

### Run Container

```bash
docker run -d -p 8080:80 --name mindx-frontend mindx-week1-frontend:latest
```

Open http://localhost:8080

## 📁 Project Structure

```
frontend/
├── src/
│   ├── App.tsx           # Main component
│   ├── App.css          # Styles
│   ├── main.tsx         # Entry point
│   └── vite-env.d.ts    # Type definitions
├── public/              # Static assets
├── Dockerfile           # Docker build
├── nginx.conf          # Nginx config for production
├── package.json        # Dependencies
└── vite.config.ts      # Vite configuration
```

## 🌐 Endpoints Used

Frontend communicates with these API endpoints:

- `GET /health` - Check API status
- `GET /api/hello/:name` - Test API with name

## ✅ Week 1 Progress

- [x] Create React Frontend ✅
- [x] API Integration ✅
- [x] Docker Ready ✅
- [ ] Deploy to AKS (pending DevOps)

---

**Author**: MindX Engineer Onboarding  
**Week**: 1  
**Last Updated**: 2025-09-30
