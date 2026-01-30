# Elora Art - Complete System Documentation

## 🏗️ System Architecture

### Overview
Elora Art is a comprehensive enterprise SaaS platform designed for managing art installation projects with a focus on validation, usability, and performance. The system follows a microservices architecture with clear separation of concerns.

### Technology Stack
- **Backend API**: NestJS + TypeScript + MongoDB
- **Web Portal**: Next.js 14 + TypeScript + Tailwind CSS
- **Admin Portal**: Next.js 14 + TypeScript + Tailwind CSS  
- **Mobile App**: React Native + Expo + TypeScript
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: Google Drive API (primary) + Local filesystem (fallback)
- **Authentication**: JWT + Refresh Tokens + RBAC
- **Infrastructure**: Docker + Docker Compose

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MongoDB (if running locally)
- Google Drive API credentials (optional)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd elora-art

# Install all dependencies
npm run install:all

# Copy environment file
cp .env.example .env

# Start with Docker (recommended)
docker-compose up -d

# OR start in development mode
npm run dev
```

### Environment Configuration
Edit `.env` file with your configuration:
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/elora-art

# JWT Secrets (change in production)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Google Drive API (optional)
GOOGLE_DRIVE_CLIENT_ID=your-client-id
GOOGLE_DRIVE_CLIENT_SECRET=your-client-secret
GOOGLE_DRIVE_FOLDER_ID=your-root-folder-id
```

## 📱 Applications

### 1. Backend API (Port 3001)
- **Framework**: NestJS with TypeScript
- **Features**: 
  - JWT Authentication with refresh tokens
  - Role-based access control (RBAC)
  - File upload with Google Drive integration
  - Excel bulk order processing
  - Comprehensive validation
  - API documentation with Swagger

### 2. Web Portal (Port 3000)
- **Framework**: Next.js 14 with App Router
- **Target Users**: Clients
- **Features**:
  - Order tracking and management
  - File downloads and viewing
  - Progress tracking
  - Responsive design

### 3. Admin Portal (Port 3002)
- **Framework**: Next.js 14 with App Router
- **Target Users**: Admins, Super Admins
- **Features**:
  - Complete order management
  - User management
  - Bulk order upload via Excel
  - Analytics and reporting
  - System configuration

### 4. Mobile App
- **Framework**: React Native with Expo
- **Target Users**: Rookies, Installation Teams
- **Features**:
  - Order assignment notifications
  - Measurement collection with photos
  - GPS location capture
  - Offline support with sync
  - Installation completion tracking

## 👥 User Roles & Permissions

### Super Admin
- Full system access
- User management
- System configuration
- All order operations

### Admin
- Order management
- Client management
- User management (limited)
- Bulk operations

### Rookie
- View assigned orders
- Submit measurements
- Upload photos
- Update order status

### Installation Team
- View installation-ready orders
- Submit completion proof
- Update installation status

### Client
- View own orders
- Download reports
- Track progress

## 🔄 Core Business Workflow

### 1. Bulk Order Creation
```
Admin uploads Excel → Validation → Preview → Confirmation → Orders created
```
**Validations**:
- Excel structure validation
- Duplicate detection
- Client/store existence check
- Data type validation

### 2. Rookie Assignment & Measurement
```
Order assigned → Rookie visits → Takes measurements → Uploads photos → Submits
```
**Validations**:
- Order must be in "Assigned" status
- Mandatory measurement fields
- Image quality validation
- GPS location (optional)

### 3. Installation Process
```
Production complete → Installer assigned → Installation → Proof upload → Complete
```
**Validations**:
- Cannot edit rookie measurements
- Mandatory completion checklist
- Installation proof required

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  name: String,
  password: String (hashed),
  role: Enum['super_admin', 'admin', 'rookie', 'installation', 'client'],
  isActive: Boolean,
  phone: String,
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  orderNumber: String (unique),
  clientId: ObjectId (ref: Client),
  storeId: ObjectId,
  status: Enum[...statuses],
  items: [{
    productType: String,
    specifications: Object,
    quantity: Number,
    notes: String
  }],
  assignedRookie: ObjectId (ref: User),
  assignedInstaller: ObjectId (ref: User),
  measurementId: ObjectId (ref: Measurement),
  installationId: ObjectId (ref: Installation),
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Measurements Collection
```javascript
{
  _id: ObjectId,
  orderId: ObjectId (ref: Order),
  rookieId: ObjectId (ref: User),
  measurements: Object,
  images: [ObjectId] (ref: FileReference),
  notes: String,
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  },
  submittedAt: Date
}
```

## 🎨 UI/UX Design System

### Color Palette (Zoho-inspired)
```css
Primary: #0ea5e9 (Soft Blue)
Secondary: #64748b (Neutral Gray)
Success: #22c55e (Muted Green)
Warning: #f59e0b (Soft Amber)
Error: #ef4444 (Calm Red)
```

### Typography
- **Font**: Inter (web) / System fonts (mobile)
- **Scale**: Consistent font scale with proper line heights
- **Hierarchy**: Clear visual hierarchy

### Spacing System
- **Grid**: 8px base unit
- **Consistency**: Uniform spacing throughout
- **Responsive**: Adapts to different screen sizes

### Components
- **Buttons**: Consistent styling with hover states
- **Forms**: Inline validation with helpful messages
- **Cards**: Soft shadows with rounded corners
- **Modals**: Focus management and keyboard navigation

## 📁 File Management

### Google Drive Integration
- **Primary Storage**: Google Drive API
- **Fallback**: Local filesystem
- **Organization**: Automatic folder structure
  - `/Orders/{orderNumber}/`
  - `/Measurements/{orderNumber}/`
  - `/Installations/{orderNumber}/`
  - `/Reports/`

### File Validation
- **Types**: Images (JPEG, PNG, WebP), Documents (PDF, Excel)
- **Size Limits**: 10MB for images, 25MB for documents
- **Security**: Virus scanning hooks (configurable)

## 🔒 Security Features

### Authentication
- **JWT Tokens**: Short-lived access tokens
- **Refresh Tokens**: Long-lived, securely stored
- **Password Hashing**: bcrypt with salt rounds

### Authorization
- **RBAC**: Role-based access control
- **Route Protection**: API and frontend route guards
- **Resource Access**: User-specific data filtering

### Data Protection
- **Input Validation**: Comprehensive validation on all inputs
- **SQL Injection**: MongoDB with parameterized queries
- **XSS Protection**: Input sanitization and CSP headers
- **CORS**: Configured for specific origins

## 📊 API Endpoints

### Authentication
```
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
POST /api/v1/auth/register
GET  /api/v1/auth/me
```

### Orders
```
GET    /api/v1/orders
POST   /api/v1/orders
GET    /api/v1/orders/:id
PATCH  /api/v1/orders/:id
DELETE /api/v1/orders/:id
POST   /api/v1/orders/bulk-upload
POST   /api/v1/orders/:id/assign-rookie
POST   /api/v1/orders/:id/assign-installer
```

### Users
```
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
GET    /api/v1/users/rookies
GET    /api/v1/users/installers
```

### Files
```
POST   /api/v1/files/upload
GET    /api/v1/files/:id
GET    /api/v1/files/:id/download
DELETE /api/v1/files/:id
```

## 🐳 Docker Deployment

### Services
- **MongoDB**: Database with initialization script
- **Redis**: Caching (optional)
- **API**: NestJS backend
- **Web Portal**: Next.js client portal
- **Admin Portal**: Next.js admin panel
- **Nginx**: Reverse proxy (optional)

### Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild services
docker-compose build
```

## 🧪 Testing

### API Testing
```bash
cd api
npm run test        # Unit tests
npm run test:e2e    # End-to-end tests
npm run test:cov    # Coverage report
```

### Frontend Testing
```bash
cd web-portal
npm run test        # Jest tests
npm run test:watch  # Watch mode
```

## 📈 Performance Optimizations

### Backend
- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis for frequently accessed data
- **File Streaming**: Efficient file upload/download
- **Rate Limiting**: API protection against abuse

### Frontend
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js image optimization
- **Lazy Loading**: Components and routes
- **Bundle Analysis**: Webpack bundle analyzer

### Mobile
- **Offline Support**: Local storage with sync
- **Image Compression**: Automatic image optimization
- **Background Sync**: Queue operations for offline use

## 🔧 Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Consistent code formatting
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks

### Git Workflow
```bash
feature/feature-name
bugfix/bug-description
hotfix/critical-fix
```

### Testing Strategy
- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Complete user workflow testing

## 🚀 Production Deployment

### Environment Setup
1. **Database**: MongoDB Atlas or self-hosted
2. **File Storage**: Google Drive API setup
3. **SSL Certificates**: Let's Encrypt or commercial
4. **Domain Configuration**: DNS setup
5. **Monitoring**: Application and infrastructure monitoring

### Scaling Considerations
- **Horizontal Scaling**: Multiple API instances
- **Database Sharding**: For large datasets
- **CDN**: Static asset delivery
- **Load Balancing**: Traffic distribution

## 📞 Support & Maintenance

### Monitoring
- **Application Logs**: Structured logging
- **Error Tracking**: Centralized error reporting
- **Performance Metrics**: Response times and throughput
- **Health Checks**: Service availability monitoring

### Backup Strategy
- **Database Backups**: Automated daily backups
- **File Backups**: Google Drive redundancy
- **Configuration Backups**: Environment and settings

### Updates
- **Security Updates**: Regular dependency updates
- **Feature Releases**: Staged deployment process
- **Database Migrations**: Version-controlled schema changes

---

## 🎯 Key Features Summary

✅ **Enterprise-grade architecture** with microservices
✅ **Zoho-style UI/UX** with pixel-perfect design
✅ **Complete RBAC** with secure authentication
✅ **Bulk Excel processing** with validation
✅ **Google Drive integration** with local fallback
✅ **Mobile app** for field operations
✅ **Real-time updates** and notifications
✅ **Comprehensive validation** at all levels
✅ **Docker deployment** ready
✅ **Production-ready** with monitoring and scaling

This system is designed to handle enterprise-scale operations while maintaining excellent user experience and robust security.