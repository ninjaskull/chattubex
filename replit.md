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

### Neon Database Integration with Import Branch (August 11, 2025)
- ✓ Successfully reconfigured database connection to use Neon database with "import" branch
- ✓ Updated database configuration to prioritize NEON_DATABASE_URL over local DATABASE_URL
- ✓ Modified connection pool settings for optimal Neon cloud database performance
- ✓ Enabled SSL configuration for secure Neon database connections
- ✓ Verified database schema synchronization with `npm run db:push`
- ✓ Confirmed all required tables exist: campaigns, contacts, documents, notes, users
- ✓ Database is ready to receive campaign data import from campaign_db_backup.sql
- ✓ Enhanced backup import interface to support both JSON and SQL file formats

### Deployment Files Cleanup (August 11, 2025)
- ✓ Removed all third-party automatic deployment configurations
- ✓ Deleted AWS, Heroku, Railway, Render, Vercel, Fly.io deployment files
- ✓ Removed Docker and Docker Compose configurations
- ✓ Cleaned up deployment scripts (deploy-aws.sh, deploy.sh, install.sh)
- ✓ Eliminated automatic server creation during AWS deployment
- ✓ Project now ready for manual AWS deployment without conflicts

### Chat History Persistence Fix (August 11, 2025)
- ✓ Fixed chatbot chat history not being saved properly to database
- ✓ Resolved LSP diagnostic syntax errors in pawmate.tsx component
- ✓ Enhanced sessionId management to ensure proper chat session tracking
- ✓ Verified chat messages are successfully saved and retrieved from database
- ✓ Updated chat API response handling to properly update frontend sessionId
- ✓ Confirmed chat history persistence across browser sessions
- ✓ Database tables (chat_sessions, chat_messages) working correctly
- ✓ All chat functionality now fully operational with persistent storage

### Complete Branding Update to FallOwl (August 11, 2025)
- ✓ Updated all branding references from "LeadIQ Pro" to "FallOwl" across the application
- ✓ Changed page title in HTML to "FallOwl - AI-Powered Lead Scoring & Business Intelligence Platform"
- ✓ Updated main navigation, dashboard headers, and footer copyright to FallOwl branding
- ✓ Modified Duggu AI assistant to use cute dog icons (🐕) instead of robot icons
- ✓ Changed default petType from "assistant" to "dog" for all AI interactions
- ✓ Updated AI assistant persona to consistently show dog avatars in chat interface
- ✓ Modified enhanced chatbot component footer to show "Powered by FallOwl Intelligence"
- ✓ Ensured consistent branding across landing page, dashboard, and AI components
- ✓ Maintained professional appearance while implementing friendly dog-themed AI assistant

### Professional Logo Implementation (August 11, 2025)
- ✓ Replaced dog emoji logos with professional FallOwl logo on landing page
- ✓ Updated navigation header with clean logo image (image_1754929915271.png)
- ✓ Updated footer branding with professional logo implementation
- ✓ Maintained dog persona for AI assistant chat interface only
- ✓ Enhanced brand consistency across landing page and marketing materials

### Database Migration System Implementation (August 11, 2025)
- ✓ Created comprehensive database migration solution for old database backup
- ✓ Built automated backup tool (`scripts/backup-options.ts`) with JSON/SQL export capabilities
- ✓ Implemented migration script (`scripts/database-migration.ts`) with connection testing
- ✓ Added backup import API endpoints (`/api/backup/import`, `/api/backup/status`)
- ✓ Created web interface (`/backup-import`) for uploading and importing backup files
- ✓ Added support for multiple migration methods (pg_dump, JSON, CSV, SQL)
- ✓ Integrated error handling, progress tracking, and detailed migration reporting
- ✓ Documented comprehensive migration guide with troubleshooting steps
- ✓ Configured routing and authentication for backup import interface
- ✓ Ready to migrate data from `postgresql://sunil:sunil123@localhost:5432/campaign_db`

### Application Debugging and Startup Fix (August 11, 2025)
- ✓ Resolved DATABASE_URL environment variable configuration issue
- ✓ Successfully ran database schema push with `npm run db:push`
- ✓ Fixed port conflicts during application startup process
- ✓ Verified database connection establishment on startup
- ✓ Confirmed API endpoints are responsive (health check working)
- ✓ Application now running successfully on port 5000
- ✓ Frontend build system (Vite) connecting properly
- ✓ All services operational and ready for use

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
- ✓ Created Fallowl attribution and specialized lead generation focus

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

### Advanced AI Business Intelligence Transformation (August 10, 2025)
- ✓ Successfully switched from mock service to real OpenAI API using user-provided API key
- ✓ Transformed chatbot into comprehensive business intelligence assistant with advanced capabilities
- ✓ Added complete Apollo.io API integration knowledge and expertise
- ✓ Enhanced AI with advanced lead scoring, prospecting strategies, and automation workflows
- ✓ Created dedicated Apollo.io service with comprehensive API reference and recommendations
- ✓ Added intelligent query detection for Apollo.io questions and database operations
- ✓ Enhanced system prompts with multi-modal capabilities and strategic business intelligence
- ✓ Updated interface with advanced action buttons for executive search and Apollo.io guidance
- ✓ Integrated real-time lead scoring algorithms with title-based authority analysis
- ✓ Added automated workflow recommendations and process optimization suggestions

### Enhanced Duggu AI Interface with Advanced Search (August 10, 2025)
- ✓ Completely rebuilt Duggu chat interface with advanced search capabilities
- ✓ Removed separate AI search interface and integrated all functionality into single chatbot
- ✓ Advanced data visualization using card and compact view modes for large datasets
- ✓ Intelligent query detection automatically routes between AI chat and database search
- ✓ Enhanced contact cards with expandable details, phone numbers, and LinkedIn profiles
- ✓ Support for displaying 100+ search results with pagination and filtering
- ✓ Real-time search through campaign data with complete contact information
- ✓ Professional contact visualization with company, title, and multiple phone numbers
- ✓ Seamless switching between conversation and database search in unified interface
- ✓ Quick action buttons for common searches and AI business intelligence questions

### Advanced CSV Export/Import Module Implementation (August 10, 2025)
- ✓ Built comprehensive CSV export system with customizable file naming and headers
- ✓ **UPDATED:** Implemented direct save-to-records functionality instead of file downloads
- ✓ **NEW:** Created `/api/export-save/csv` endpoint that saves search results as new campaigns
- ✓ Integrated smart search-to-CSV export directly from chat search results
- ✓ Created advanced CSV import module with file validation and campaign creation
- ✓ Implemented drag-and-drop file upload with 10MB size limit and type validation
- ✓ Added conflict resolution for duplicate campaign names with suggested alternatives
- ✓ Built secure data encryption for all imported CSV data with base64 encoding
- ✓ Created real-time progress indicators and comprehensive error handling
- ✓ Integrated CSV operations into Duggu chat interface with dedicated buttons
- ✓ **UPDATED:** Changed "Export CSV" buttons to "Save Results" for clarity
- ✓ Added automatic success notifications and chat feedback for completed operations
- ✓ Implemented backend API endpoints with proper validation and error responses

## User Preferences

- **Platform Branding**: FallOwl (updated from LeadIQ Pro) - Professional logo implementation (August 11, 2025)
- **AI Name**: Duggu (customizable via settings)
- **AI Persona**: Cute dog assistant with 🐕 icon (updated from robot) - Chat interface only
- **AI Creator**: FallOwl  
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