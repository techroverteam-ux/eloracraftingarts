# Elora Art - Enterprise SaaS Platform

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Web Portal    │    │   Admin Panel   │
│  (React Native) │    │   (Next.js)     │    │   (Next.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Gateway   │
                    │   (NestJS)      │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    MongoDB      │    │  Google Drive   │    │   File System   │
│   (Primary DB)  │    │  (Primary)      │    │   (Fallback)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Tech Stack
- **Mobile**: React Native + Expo + TypeScript
- **Web**: Next.js 14 + App Router + TypeScript
- **API**: NestJS + TypeScript
- **Database**: MongoDB + Mongoose
- **Storage**: Google Drive API + Local fallback
- **Auth**: JWT + Refresh Tokens + RBAC
- **Infrastructure**: Docker + Docker Compose

## Quick Start
```bash
# Clone and setup
git clone <repo>
cd elora-art

# Start all services
docker-compose up -d

# Development mode
npm run dev:all
```

## Project Structure
```
elora-art/
├── mobile/           # React Native app
├── web-portal/       # Next.js client portal
├── admin-portal/     # Next.js admin panel
├── api/             # NestJS backend
├── shared/          # Shared types & utilities
├── docker/          # Docker configurations
└── docs/           # Documentation
```

## Core Features
1. **Bulk Order Management** - Excel upload with validation
2. **Rookie Assignment** - Measurement collection workflow
3. **Installation Tracking** - Team coordination
4. **Production Pipeline** - End-to-end order lifecycle
5. **File Management** - Google Drive integration
6. **Role-based Access** - Multi-tenant security
7. **Reports & Exports** - PDF/Excel generation

## User Roles
- **Super Admin**: Full system control
- **Admin**: Order & user management  
- **Rookie**: Measurement collection
- **Installation**: Installation tasks
- **Client**: View & download access