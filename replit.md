# Braille Autocorrect Application

## Overview

This is a React-based web application that provides Braille autocorrect functionality. The system allows users to input Braille patterns using QWERTY keyboard mappings and provides intelligent word suggestions using autocorrect algorithms. It features a modern UI built with shadcn/ui components and Tailwind CSS, with a Node.js/Express backend for data management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **API Pattern**: RESTful endpoints under `/api` prefix
- **Development**: Hot module replacement with Vite integration

### Key Components

#### Braille Input System
- QWERTY to Braille dot mapping (D→1, W→2, Q→3, K→4, O→5, P→6)
- Real-time pattern building and visualization
- Visual dot display component for accessibility

#### Autocorrect Engine
- Multiple distance algorithms (Levenshtein, Damerau-Levenshtein)
- Frequency-based word ranking
- Pattern-based suggestion filtering
- Configurable confidence scoring

#### Performance Monitoring
- Response time tracking
- Visual performance charts
- Session data persistence
- User analytics collection

#### Testing Framework
- Built-in test case runner
- Predefined test scenarios for different error types
- Custom test case creation
- Real-time accuracy reporting

## Data Flow

1. **User Input**: QWERTY keys mapped to Braille dots through event handlers
2. **Pattern Building**: Dots accumulated into Braille patterns using BraillePatternBuilder
3. **Dictionary Lookup**: Patterns sent to AutocorrectEngine for word matching
4. **Suggestion Generation**: Multiple algorithms generate ranked suggestions
5. **Result Display**: Suggestions rendered with confidence indicators
6. **Performance Tracking**: Response times and accuracy metrics collected
7. **Data Persistence**: Session data stored via REST API to PostgreSQL

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database queries and migrations
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React routing
- **@radix-ui/***: Accessible UI primitives
- **class-variance-authority**: Component variant management
- **zod**: Runtime type validation and schema definitions

### Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Production bundling for server code
- **@replit/vite-plugin-cartographer**: Replit integration
- **@replit/vite-plugin-runtime-error-modal**: Development error handling

## Deployment Strategy

### Development Mode
- Vite dev server with HMR for frontend
- tsx with nodemon-like behavior for backend
- Replit-specific development plugins enabled
- Database migrations via `drizzle-kit push`

### Production Build
- Frontend: Vite builds to `dist/public` directory
- Backend: esbuild bundles server to `dist/index.js`
- Static file serving from Express in production
- Database: PostgreSQL connection via environment variables

### Database Schema
- **users**: User authentication and profiles
- **braille_words**: Dictionary with word, pattern, frequency, language
- **user_sessions**: Performance metrics and session data
- Drizzle schema defined in `shared/schema.ts` for type safety

### Environment Configuration
- `DATABASE_URL` required for PostgreSQL connection
- `NODE_ENV` determines development vs production behavior
- Shared types between client and server via `shared/` directory

## Changelog

Changelog:
- July 01, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.