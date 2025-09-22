# Agent CRM + Ops

## Overview

This is a client relationship management (CRM) and operations application built for the Bangladeshi market. The system manages client information, financial tracking (deposits and spending), meeting scheduling, and provides AI-powered query capabilities. The application features a Bengali-language interface and is designed to handle client portfolios with wallet-based financial management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **Styling**: Tailwind CSS with custom design system using CSS variables
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful JSON API with structured error handling
- **Middleware**: Request logging, CORS handling, and JSON parsing
- **Development**: Hot module replacement with Vite integration

### Data Storage Solutions
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured for Neon Database)
- **Schema**: Strongly typed schema definitions with Zod validation
- **Development Storage**: In-memory storage implementation with sample data
- **Migrations**: Drizzle Kit for database migrations

### Database Schema Design
- **Clients Table**: Core client information with wallet balances, scopes, and portal keys
- **Spend Logs Table**: Financial transaction tracking linked to clients
- **Meetings Table**: Appointment scheduling with reminder capabilities
- **Relationships**: Foreign key constraints ensuring data integrity

### Authentication and Authorization
- **Session Management**: Cookie-based sessions with PostgreSQL session store
- **Portal Access**: Client-specific portal keys for secure access
- **CSRF Protection**: Built-in request validation

### AI Query System
- **Natural Language Processing**: Custom query parser for Bengali and English
- **Data Analysis**: Client filtering and aggregation based on natural language queries
- **Response Generation**: Structured results with relevant client data extraction

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon Database
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **express**: Web application framework for Node.js
- **@tanstack/react-query**: Powerful data synchronization for React

### UI and Styling Dependencies
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant management for components
- **lucide-react**: Modern icon library

### Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **drizzle-kit**: Database migration and introspection tool
- **esbuild**: JavaScript bundler for production builds

### Additional Integrations
- **recharts**: Chart library for data visualization
- **date-fns**: Date manipulation and formatting
- **connect-pg-simple**: PostgreSQL session store for Express
- **wouter**: Minimalist routing library for React