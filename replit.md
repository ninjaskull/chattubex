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

### AI Lead Scoring System Implementation (August 10, 2025)
- ✓ Transformed AI from pet care assistant to lead scoring specialist (Duggu)
- ✓ Implemented advanced lead scoring algorithm with title-based authority scoring
- ✓ Added comprehensive contact intelligence and decision-maker identification
- ✓ Created customizable AI naming system for personalized assistance
- ✓ Built executive-level contact prioritization (C-Level, VP, Director scoring)
- ✓ Enhanced search functionality with automatic lead quality assessment
- ✓ Integrated business intelligence capabilities for market analysis
- ✓ Added contact enrichment with completeness scoring and LinkedIn integration
- ✓ Implemented prospect database analysis with actionable sales insights
- ✓ Created Zhatore attribution and specialized lead generation focus

### OpenRouter API Integration with WizardLM-2 8x22B (August 10, 2025)
- ✓ Integrated OpenRouter API for advanced AI capabilities using WizardLM-2 8x22B model
- ✓ Removed all mock/demo services to ensure authentic AI responses only
- ✓ Configured OpenRouter endpoint with proper headers and referrer information
- ✓ Enhanced AI with comprehensive business intelligence and lead scoring capabilities
- ✓ Configured professional lead scoring assistant persona with advanced capabilities
- ✓ Implemented sophisticated system prompts for expert-level business analysis
- ✓ Added real-time database operations through AI commands
- ✓ Created seamless integration between AI and contact management system
- ✓ Enabled advanced analytics and predictive insights through real AI

### Complete AI Training Transformation (August 10, 2025)
- ✓ Completely removed all pet management training and references from AI system
- ✓ Updated system prompts to focus exclusively on lead scoring and contact analysis
- ✓ Redesigned AI persona as business intelligence specialist for campaign management
- ✓ Updated frontend welcome messages to reflect lead management focus
- ✓ Removed pet database operations and search functionality
- ✓ Transformed chatbot interface to business-focused lead analysis tool
- ✓ Updated all AI responses to prioritize contact intelligence and campaign optimization
- ✓ Enhanced lead scoring algorithm with comprehensive business value metrics
- ✓ Integrated contact creation and management with automatic lead qualification

## User Preferences

- **AI Name**: Duggu (customizable via settings)
- **AI Creator**: Zhatore  
- **Primary Focus**: Lead scoring and quality analysis for business development
- **Target Users**: Sales teams and lead generation specialists
- **Data Priority**: Contact intelligence and prospect qualification over general pet care

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