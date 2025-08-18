# Project Overview

This is a full-stack web application for comprehensive campaign management, focusing on secure data handling and advanced lead scoring. The platform empowers sales teams and lead generation specialists with tools for contact intelligence, prospect qualification, and business intelligence. Key capabilities include secure authentication, campaign and contact management, file uploads, and robust data encryption, all delivered through a modern, responsive user interface.

# User Preferences

- **Platform Branding**: FallOwl (UI branding), zhatore (AI responses only)
- **AI Name**: Duggu (customizable via settings, but never mentioned in responses)
- **AI Creator**: zhatore (always use "created by zhatore" or "AI of zhatore")
- **AI Persona**: Professional for business queries, cute/flirty pet-like for casual conversations
- **Emoji Policy**: NO emojis in any AI responses
- **Primary Focus**: Lead scoring and quality analysis for business development
- **Target Users**: Sales teams and lead generation specialists
- **Data Priority**: Provide best data analysis and motivate users to score leads effectively
- **Contact Display**: Use modern AI chat interface with compact contact cards displaying all contact details in a canvas format
- **Search Result Size**: Display up to 100 contacts in search results for comprehensive data viewing

# System Architecture

The application features a React frontend with a TypeScript Express.js backend.

## Frontend

- **Framework**: React with TypeScript
- **Routing**: Wouter
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **UI/UX**: Professional design with blue-to-purple gradients, light mode default, professional avatar system with initials, and paw icon branding. Enhanced contact visualization with professional contact cards, interactive network canvas, and tabbed display modes for search results (Cards, Network View, Summary).

## Backend

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with dashboard password
- **File Handling**: Multer for file uploads
- **Security**: Data encryption utilities for sensitive information
- **Real-time Communication**: WebSocket server for live updates on notes.
- **AI Integration**: Advanced AI capabilities for lead scoring and business intelligence, transforming from a general assistant to a specialist.
- **Data Migration**: Comprehensive system for database backup and import (JSON/SQL), including conflict resolution and secure encryption for imported data.
- **CSV Operations**: Advanced CSV export/import module with direct save-to-records functionality and integrated workflow within the AI chat interface.
- **Database Architecture**: Dual database architecture with a main database pool for write operations and a dedicated read-only database pool for chatbot data access, ensuring data isolation and optimized performance. The chatbot uses an external, read-only database connection with dynamic schema discovery for real contact data.

## Core Features

- Secure Authentication
- Campaign Management with encrypted data, including saving search results as campaigns.
- File Upload (CSV, documents)
- Contact Management with advanced search capabilities integrated into the AI chat interface.
- Data Encryption
- Responsive UI with dark/light theme support.
- AI Lead Scoring System with title-based authority scoring, contact intelligence, and decision-maker identification.
- Real-time Updates for note creation, updates, and deletion.
- Advanced Search integrated into the AI chat interface with data visualization and quick action buttons, featuring improved fuzzy search precision for job titles.
- Enhanced Contact Visualization with contact cards, interactive network canvas, and tabbed display modes for search results.

# External Dependencies

- **Database**: Neon (PostgreSQL)
- **AI Services**: OpenRouter API (using Claude-3-Haiku)
- **Third-party APIs**: Apollo.io API (for advanced business intelligence, lead scoring, and prospecting)