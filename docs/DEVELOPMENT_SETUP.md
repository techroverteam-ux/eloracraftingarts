# Elora Art - Development Setup Guide

## 🚀 Quick Start (5 minutes)

### Option 1: Docker (Recommended)
```bash
# Clone and setup
git clone <repository-url>
cd elora-art

# Copy environment file
cp .env.example .env

# Start all services with Docker
docker-compose up -d

# Access applications
# API: http://localhost:3001
# Web Portal: http://localhost:3000  
# Admin Portal: http://localhost:3002
```

### Option 2: Local Development
```bash
# Install dependencies for all projects
npm run install:all

# Start all services in development mode
npm run dev

# OR start individual services
npm run dev:api      # Backend API
npm run dev:web      # Web Portal
npm run dev:admin    # Admin Portal
npm run dev:mobile   # Mobile App (Expo)
```

## 📋 Prerequisites

### Required
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **Docker**: Latest version (for containerized setup)
- **Docker Compose**: Latest version

### Optional
- **MongoDB**: 7.0+ (if not using Docker)
- **Redis**: 7.0+ (for caching)
- **Google Drive API**: For file storage integration

## 🔧 Environment Configuration

### 1. Copy Environment File
```bash
cp .env.example .env
```

### 2. Configure Required Variables
```bash
# Database (required)
MONGODB_URI=mongodb://localhost:27017/elora-art

# JWT Secrets (CHANGE IN PRODUCTION)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# API Configuration
API_PORT=3001
WEB_PORT=3000
ADMIN_PORT=3002
```

### 3. Optional: Google Drive Integration
```bash
# Get credentials from Google Cloud Console
GOOGLE_DRIVE_CLIENT_ID=your-google-drive-client-id
GOOGLE_DRIVE_CLIENT_SECRET=your-google-drive-client-secret
GOOGLE_DRIVE_FOLDER_ID=your-root-folder-id
```

## 🏗️ Project Structure
```
elora-art/
├── api/                 # NestJS Backend API
├── web-portal/          # Next.js Client Portal
├── admin-portal/        # Next.js Admin Panel
├── mobile/              # React Native Mobile App
├── shared/              # Shared types and utilities
├── docker/              # Docker configurations
├── docs/                # Documentation
├── docker-compose.yml   # Docker services
└── package.json         # Root package.json
```

## 🐳 Docker Setup (Recommended)

### Services Included
- **MongoDB**: Database with initialization
- **Redis**: Caching layer
- **API**: NestJS backend
- **Web Portal**: Client interface
- **Admin Portal**: Admin interface
- **Nginx**: Reverse proxy (optional)

### Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api
docker-compose logs -f web-portal

# Stop services
docker-compose down

# Rebuild after changes
docker-compose build
docker-compose up -d
```

### Default Ports
- **API**: http://localhost:3001
- **Web Portal**: http://localhost:3000
- **Admin Portal**: http://localhost:3002
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## 💻 Local Development Setup

### 1. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all project dependencies
npm run install:all

# OR install individually
npm run install:api
npm run install:web
npm run install:admin
npm run install:mobile
```

### 2. Start MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name elora-mongo mongo:7.0

# OR install locally and start
mongod --dbpath /path/to/data
```

### 3. Start Services
```bash
# Start all services
npm run dev

# OR start individually
npm run dev:api      # http://localhost:3001
npm run dev:web      # http://localhost:3000
npm run dev:admin    # http://localhost:3002
npm run dev:mobile   # Expo development server
```

## 📱 Mobile Development

### Setup
```bash
cd mobile

# Install Expo CLI globally
npm install -g @expo/cli

# Start development server
npm start

# Run on device/simulator
npm run android  # Android
npm run ios      # iOS
npm run web      # Web browser
```

### Testing on Device
1. Install Expo Go app on your device
2. Scan QR code from terminal
3. App will load on your device

## 🗄️ Database Setup

### Automatic Setup (Docker)
Database is automatically initialized with:
- Collections with validation rules
- Indexes for performance
- Default super admin user

### Manual Setup
```bash
# Connect to MongoDB
mongo mongodb://localhost:27017/elora-art

# Run initialization script
load('docker/mongo-init.js')
```

### Default Admin User
```
Email: admin@eloraart.com
Password: admin123
Role: Super Admin
```

## 🧪 Testing

### API Tests
```bash
cd api
npm run test        # Unit tests
npm run test:watch  # Watch mode
npm run test:cov    # Coverage report
npm run test:e2e    # End-to-end tests
```

### Frontend Tests
```bash
cd web-portal
npm run test        # Jest tests
npm run test:watch  # Watch mode

cd admin-portal
npm run test
```

## 🔍 Development Tools

### API Documentation
- **Swagger UI**: http://localhost:3001/api/docs (when implemented)
- **Postman Collection**: Available in `/docs/postman/`

### Database Tools
- **MongoDB Compass**: GUI for MongoDB
- **Studio 3T**: Advanced MongoDB IDE

### Code Quality
```bash
# Linting
npm run lint        # All projects
npm run lint:api    # API only
npm run lint:web    # Web portal only

# Type checking
npm run type-check  # TypeScript validation
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

#### MongoDB Connection Issues
```bash
# Check MongoDB status
docker ps | grep mongo

# Restart MongoDB
docker restart elora-mongodb
```

#### Node Modules Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clean all projects
npm run clean:all  # (if script exists)
```

#### Docker Issues
```bash
# Clean Docker
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```

### Environment Issues
1. **Check .env file exists and has correct values**
2. **Verify MongoDB is running**
3. **Check port availability**
4. **Verify Node.js version (18+)**

## 📊 Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# Test locally
npm run test

# Commit and push
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

### 2. Code Style
- **ESLint**: Automatic linting
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **TypeScript**: Strict mode enabled

### 3. Testing Strategy
- **Unit Tests**: Individual components
- **Integration Tests**: API endpoints
- **E2E Tests**: Complete workflows

## 🚀 Production Build

### Build All Projects
```bash
npm run build
```

### Individual Builds
```bash
npm run build:api    # NestJS build
npm run build:web    # Next.js build
npm run build:admin  # Next.js build
```

### Production Start
```bash
npm run start        # All services
npm run start:api    # API only
npm run start:web    # Web only
npm run start:admin  # Admin only
```

## 📞 Getting Help

### Documentation
- **API Docs**: `/docs/api/`
- **Frontend Docs**: `/docs/frontend/`
- **Mobile Docs**: `/docs/mobile/`

### Common Commands Reference
```bash
# Development
npm run dev                 # Start all services
npm run dev:api            # Start API only
npm run dev:web            # Start web portal
npm run dev:admin          # Start admin portal
npm run dev:mobile         # Start mobile app

# Building
npm run build              # Build all
npm run build:api          # Build API
npm run build:web          # Build web portal

# Testing
npm run test               # Run all tests
npm run test:api           # API tests only
npm run lint               # Lint all code

# Docker
docker-compose up -d       # Start services
docker-compose down        # Stop services
docker-compose logs -f     # View logs
```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] API responds at http://localhost:3001
- [ ] Web portal loads at http://localhost:3000
- [ ] Admin portal loads at http://localhost:3002
- [ ] Can login with default admin credentials
- [ ] Database connection working
- [ ] File upload functionality works
- [ ] Mobile app starts (if developing mobile)

**🎉 You're ready to develop with Elora Art!**