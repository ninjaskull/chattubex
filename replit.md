# Project Overview

This is a full-stack web application for campaign management with secure data handling, built with React frontend and Express.js backend.

## Architecture

### Frontend (React + TypeScript)
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with Zod validation

### Backend (Express.js + TypeScript)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with dashboard password
- **File Upload**: Multer for handling file uploads
- **Security**: Data encryption utilities for sensitive information

### Database Schema
- **Users**: User authentication
- **Campaigns**: Campaign data with encrypted content
- **Contacts**: Contact management for campaigns
- **Documents**: File upload management
- **Notes**: Encrypted note storage

## Recent Changes

### Migration to Replit Environment (August 10, 2025)
- ✓ Updated database configuration from Neon to standard PostgreSQL
- ✓ Installed required PostgreSQL dependencies (`pg` package)
- ✓ Successfully pushed database schema with `drizzle-kit push`
- ✓ Verified application startup and database connectivity
- ✓ Configured dashboard password as secure environment secret
- ✓ Confirmed all core functionality is working

### Real-time Updates Implementation (August 10, 2025)
- ✓ Added WebSocket server on `/ws` path for real-time communication
- ✓ Implemented real-time note creation, updates, and deletion broadcasts
- ✓ Created custom WebSocket hook for connection management and auto-reconnection
- ✓ Added live connection status indicator in the notes interface
- ✓ Automatic cache updates without page refreshes for notes functionality
- ✓ Added typing indicators showing when other users are actively typing
- ✓ Optimized database connection pooling for faster API responses

### PawMate Tab Addition (August 10, 2025)
- ✓ Added new "PawMate" tab with dog icon for pet-related functionality
- ✓ Created interactive pet profile and chat interface
- ✓ Implemented pet care tips and activity suggestions
- ✓ Added responsive design matching the existing UI theme

## User Preferences

*(None specified yet)*

## Key Features

1. **Secure Authentication**: Dashboard access with configurable password
2. **Campaign Management**: Create and manage campaigns with encrypted data
3. **File Upload**: Support for CSV and document uploads
4. **Contact Management**: Handle contact information and email tracking
5. **Data Encryption**: Built-in encryption for sensitive data
6. **Responsive UI**: Modern interface with dark/light theme support

## Environment Configuration

- Dashboard password: `demo1234` (configured via `DASHBOARD_PASSWORD`)
- Database: PostgreSQL via `DATABASE_URL`
- Development server runs on port 5000

## Development Notes

- Uses Vite for frontend development with HMR
- TypeScript throughout the stack for type safety
- Drizzle ORM for database operations
- shadcn/ui component library for consistent UI