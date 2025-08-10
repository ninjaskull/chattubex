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

### Advanced PawMate Chatbot UI (August 10, 2025)
- ✓ Implemented high-tech chatbot interface with modern design
- ✓ Added intelligent AI responses based on user input categories
- ✓ Created settings dialog for custom pet name and type configuration
- ✓ Implemented real-time typing indicators and message animations
- ✓ Added persistent pet settings using localStorage
- ✓ Enhanced UI with gradients, animations, and modern styling
- ✓ Added support for multiple pet types (dog, cat, bird, fish, rabbit, hamster)

### OpenRouter API Integration with WizardLM-2 8x22B (August 10, 2025)
- ✓ Integrated OpenRouter API for advanced AI capabilities using WizardLM-2 8x22B model
- ✓ Removed all mock/demo services to ensure authentic AI responses only
- ✓ Configured OpenRouter endpoint with proper headers and referrer information
- ✓ Enhanced AI with comprehensive veterinary knowledge and database integration
- ✓ Configured professional pet care assistant persona with advanced capabilities
- ✓ Implemented sophisticated system prompts for expert-level pet advice
- ✓ Added real-time database operations through AI commands
- ✓ Created seamless integration between AI and pet management system
- ✓ Enabled advanced analytics and predictive insights through real AI

### Enhanced Database Integration & Chat History System (August 10, 2025)
- ✓ Integrated AI chatbot with complete database access for pet management
- ✓ Added pet registration, health record tracking, and activity logging via AI commands
- ✓ Implemented comprehensive database search and analytics through AI interface
- ✓ Created persistent chat history with secure session management
- ✓ Added new database tables for chat sessions and message history
- ✓ Built complete API endpoints for chat history management and search
- ✓ Enhanced AI to perform live database operations during conversations
- ✓ Added session-based conversation continuity and automatic title generation
- ✓ Implemented secure chat data storage with metadata tracking

### AI Lead Scoring System Transformation (August 10, 2025)
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

### Advanced AI Database Operations (August 10, 2025)
- ✓ Added real-time access to campaign and contact data
- ✓ Implemented intelligent search across all uploaded data
- ✓ Created data analysis and reporting capabilities
- ✓ Added contact filtering and segmentation features
- ✓ Built dynamic data creation and modification system
- ✓ Enabled AI to provide insights from actual uploaded data
- ✓ Integrated campaign analytics and contact management
- ✓ Added automated data quality assessment and recommendations
- ✓ Enhanced chat interface with ReactMarkdown for proper message formatting
- ✓ Fixed AI response display to show structured data with headers and bullet points

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