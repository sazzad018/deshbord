# Social Ads Expert

## Overview

This is a comprehensive client relationship management (CRM) and operations application built for the Bangladeshi market. The system manages client information, financial tracking (deposits and spending), meeting scheduling, project management, completed website credentials storage, and provides AI-powered query capabilities. The application features a Bengali-language interface and is designed to handle client portfolios with wallet-based financial management.

## Recent Changes (October 3, 2025)

### MySQL Database Migration ✅
**Converted entire application from PostgreSQL to MySQL:**
- **Database Layer**: Changed from PostgreSQL to MySQL
  - Driver: `@neondatabase/serverless` → `mysql2`
  - ORM Dialect: `drizzle-orm/neon-http` → `drizzle-orm/mysql2`
  - Connection: Pool-based MySQL connection
  
- **Schema Changes**:
  - `pgTable` → `mysqlTable`
  - `jsonb` → `json` (MySQL 5.7+ JSON support)
  - `text` → `text` and `varchar` with lengths
  - `integer` → `int`
  - `timestamp` with `datetime` for specific fields
  - UUID generation moved to application level (`crypto.randomUUID()`)
  
- **Session Store**: Using memory store (compatible with MySQL session store)
- **Production Build**: Successfully compiled for cPanel deployment
- **Package Size**: 3.0 MB (optimized for shared hosting)

### Previous Features (October 1, 2025)

#### Completed Websites Management Section
Added a new section in the Project Management page for tracking completed websites with full credential management:
- **Features**:
  - Store website admin login credentials (username/password)
  - Store cPanel credentials for hosting management
  - Track nameserver configuration (NS1 and NS2)
  - Record service provider information (Hostinger, GoDaddy, etc.)
  - Add project notes and completion dates
  - Search and filter completed websites
  - Edit and delete website records
  - Password visibility toggle for security
  
- **Database Schema**: Extended `websiteProjects` table with new fields:
  - `websiteUsername`, `websitePassword` - Website admin credentials
  - `cpanelUsername`, `cpanelPassword` - cPanel hosting credentials
  - `nameserver1`, `nameserver2` - DNS nameserver configuration
  - `serviceProvider` - Hosting provider name
  
- **UI Components**: New `CompletedWebsitesPanel` component with responsive card-based design
- **API Endpoints**: Full CRUD operations via existing `/api/website-projects` routes

## User Preferences

Preferred communication style: Simple, everyday language.
Target Deployment: Shared cPanel hosting with MySQL database only.

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
- **ORM**: Drizzle ORM with **MySQL dialect**
- **Database**: **MySQL** (shared cPanel compatible)
- **Schema**: Strongly typed schema definitions with Zod validation
- **UUID Generation**: Application-level using `crypto.randomUUID()`
- **Migrations**: Drizzle Kit for database migrations (`npm run db:push`)

### Database Schema Design
- **Clients Table**: Core client information with wallet balances, scopes, and portal keys
- **Spend Logs Table**: Financial transaction tracking linked to clients
- **Meetings Table**: Appointment scheduling with reminder capabilities
- **Website Projects Table**: Complete website credentials management with hosting details
  - Website admin login (username/password)
  - cPanel credentials (username/password)
  - Nameserver configuration (NS1/NS2)
  - Service provider information
  - Project status tracking (In Progress/Completed)
- **Projects Table**: Advanced project management with employee assignments, payments, and features tracking
- **Employees Table**: Employee management with salary tracking
- **Relationships**: Foreign key constraints ensuring data integrity

### Authentication and Authorization
- **Session Management**: Cookie-based sessions with Express Session
- **Portal Access**: Client-specific portal keys for secure access
- **CSRF Protection**: Built-in request validation

### AI Query System
- **Natural Language Processing**: Custom query parser for Bengali and English
- **Data Analysis**: Client filtering and aggregation based on natural language queries
- **Response Generation**: Structured results with relevant client data extraction

## External Dependencies

### Core Framework Dependencies
- **mysql2**: MySQL client for Node.js
- **drizzle-orm**: Type-safe ORM with MySQL support
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
- **express-session**: Session management
- **wouter**: Minimalist routing library for React

## Deployment Information

### Target Environment
- **Hosting**: Shared cPanel hosting
- **Database**: MySQL only (no PostgreSQL)
- **Node Version**: 18.x or 20.x recommended
- **Package Manager**: npm
- **Production Build**: Ready in `cpanel-deploy/` folder

### Deployment Package Contents
```
cpanel-deploy/
├── index.js (107 KB) - Production server
├── public/ - Frontend build (2.6 MB)
├── package.json - Dependencies
├── setup-database.js - MySQL setup script
├── INSTALL-MYSQL.txt - Complete deployment guide
```

### Environment Variables Required
```
DATABASE_URL=mysql://username:password@localhost:3306/database_name
NODE_ENV=production
PORT=5000
SESSION_SECRET=random-32-character-string
```

### Database Connection String Format
```
mysql://username:password@host:port/database
```

Example:
```
mysql://myuser:mypass@localhost:3306/socialads_db
```

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database
- `npm run check` - Type checking

## Production Deployment Steps

1. Create MySQL database in cPanel
2. Upload and extract `cpanel-deploy` folder
3. Create Node.js app in cPanel
4. Set environment variables
5. Run NPM Install
6. Run setup-database.js
7. Start application

Full instructions in: `cpanel-deploy/INSTALL-MYSQL.txt`
