# Project Overview

This is a full-stack web application designed for comprehensive campaign management, focusing on secure data handling and advanced lead scoring. The platform aims to empower sales teams and lead generation specialists by providing tools for contact intelligence, prospect qualification, and business intelligence. Its core capabilities include secure authentication, campaign and contact management, file uploads, and robust data encryption, all delivered through a modern, responsive user interface.

# User Preferences

- **Platform Branding**: FallOwl (UI branding remains)
- **AI Name**: Duggu (customizable via settings, but never mentioned in responses)
- **AI Creator**: zhatore (always use "created by zhatore" or "AI of zhatore")
- **AI Persona**: Professional for business queries, cute/flirty pet-like for casual conversations
- **Emoji Policy**: NO emojis in any AI responses
- **Primary Focus**: Lead scoring and quality analysis for business development
- **Target Users**: Sales teams and lead generation specialists
- **Data Priority**: Provide best data analysis and motivate users to score leads effectively

# System Architecture

The application features a React frontend with a TypeScript Express.js backend.

## Frontend

- **Framework**: React with TypeScript
- **Routing**: Wouter
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **UI/UX**: Professional design with blue-to-purple gradients, light mode default, professional avatar system with initials, and paw icon branding.

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

## Core Features

- Secure Authentication
- Campaign Management with encrypted data
- File Upload (CSV, documents)
- Contact Management
- Data Encryption
- Responsive UI with dark/light theme support
- AI Lead Scoring System with title-based authority scoring, contact intelligence, and decision-maker identification.
- Real-time Updates for note creation, updates, and deletion.
- Advanced Search integrated into the AI chat interface with data visualization and quick action buttons.

# External Dependencies

- **Database**: Neon (PostgreSQL)
- **AI Services**: OpenRouter API (using Claude-3-Haiku for improved response times)
- **Third-party APIs**: Apollo.io API (integrated for advanced business intelligence, lead scoring, and prospecting)