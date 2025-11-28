# BlueCycle - Waste Management Platform

## Overview

BlueCycle is a comprehensive waste management platform designed for efficient pickup scheduling, route optimization, and environmental sustainability tracking. The platform connects users who need waste collection services with drivers who perform pickups, while administrators manage the entire ecosystem. The system features a modern, mobile-first design inspired by premium apps like Gojek, with vibrant colors, generous spacing, and intuitive user interactions.

The platform supports three user roles:
- **Users**: Request waste pickups, track earnings from recyclables, and manage withdrawals
- **Drivers**: Accept pickup orders, track earnings (80% commission), and manage payment settings
- **Admins**: Oversee all operations, manage users, approve payments, and generate compliance reports

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool for fast development and optimized production builds.

**UI Component Library**: Shadcn UI with Radix UI primitives, providing accessible, customizable components. The design system uses Tailwind CSS with a custom configuration emphasizing:
- Modern, mobile-first layouts with generous spacing (p-6 to p-8)
- Vibrant accent colors (primary teal: HSL 168 76% 36%) with professional neutrals
- Card-based layouts with subtle shadows and larger border radius (rounded-lg to rounded-xl)
- Inter font family for clean, modern typography

**State Management**: React hooks for local state, TanStack Query (React Query) for server state management with automatic caching and refetching.

**Routing**: Wouter for lightweight client-side routing without the overhead of React Router.

**Theme System**: Custom theme provider supporting light/dark modes with CSS variables for consistent theming across components.

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript for type safety.

**API Design**: RESTful API endpoints organized by resource type (pickups, users, payments, etc.) with clear CRUD operations. All endpoints prefixed with `/api/`.

**Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple) for persistent authentication.

**Database ORM**: Drizzle ORM with Neon serverless PostgreSQL for type-safe database queries and migrations. Schema defined in `shared/schema.ts` with Zod validation schemas derived from table definitions.

**Key Design Decisions**:
- Monorepo structure with shared types between client and server
- Development mode uses Vite middleware for HMR
- Production mode serves pre-built static assets
- Path aliases (`@/`, `@shared/`) for clean imports

### Database Schema

**Core Tables**:

1. **users**: Stores all user types (admin, user, driver) with role-based access
   - Includes payment info (bankName, bankAccount) for drivers
   - Phone numbers for SMS notifications

2. **pickups**: Central table for waste collection requests
   - Links requestedById to users, assignedDriverId to drivers
   - Tracks status flow: pending → accepted → in-progress → completed
   - Stores pricing, commission split (80% driver, 20% admin)
   - Supports both pickup and dropoff delivery methods

3. **wasteCatalog**: User-defined waste items with pricing
   - Each user can maintain their own catalog
   - Links to pickups via catalogItemId

4. **routes**: Driver route optimization data
   - Associates multiple pickups with a driver
   - Tracks route status and optimization

5. **driverEarnings**: Transaction log for driver payments
   - Records earnings per pickup (80% of pickup price)
   - Links to pickups for audit trail

6. **userRewards**: Transaction log for user earnings
   - Records rewards from completed pickups
   - Enables user withdrawal requests

7. **userPayments** & **driverPayments**: Withdrawal request tracking
   - Status flow: pending → approved → completed (or rejected)
   - Stores bank details for transfers
   - Admin notes for approval/rejection reasons

8. **collectionPoints**: Physical drop-off locations
   - GPS coordinates, capacity tracking, operating hours
   - Status: available, full, maintenance

9. **wasteDisposals**: Final disposal tracking for compliance
   - Links pickups to disposal facilities
   - Certificate URLs for recycling proof

10. **qrTracking**: QR code verification system
    - Photo evidence of pickup and delivery
    - Certificate generation

11. **complianceReports**: Monthly environmental reports
    - Aggregated metrics (kg collected, recyclable %)
    - Auto-generated PDF reports

12. **smsNotifications**: SMS notification log
    - Tracks delivery status of notifications
    - Message types: pickup confirmations, payment approvals, etc.

**Commission Model**: All pickups use an 80/20 split where drivers receive 80% of the pickup price as earnings, and the platform retains 20% as commission. This is calculated and stored when pickups are completed.

### External Dependencies

**Database**: Neon Serverless PostgreSQL accessed via `@neondatabase/serverless` package with WebSocket support for persistent connections.

**UI Components**: 
- Radix UI primitives for accessible components (dialogs, dropdowns, tooltips, etc.)
- Recharts for data visualization (line charts, bar charts, pie charts)
- Lucide React for consistent iconography

**Form Handling**: React Hook Form with Zod resolvers for type-safe form validation.

**Styling**: 
- Tailwind CSS with custom configuration
- class-variance-authority for component variants
- clsx + tailwind-merge for conditional class handling

**Date Handling**: date-fns for date formatting and manipulation.

**Development Tools**:
- Vite plugins for Replit integration (runtime error overlay, cartographer, dev banner)
- TypeScript for full-stack type safety
- Drizzle Kit for database migrations

**Image Assets**: The application uses both stock images (stored in `attached_assets/stock_images/`) and generated images (in `attached_assets/generated_images/`) for waste type visualization in the catalog.

**Environment Variables Required**:
- `DATABASE_URL`: PostgreSQL connection string (Neon serverless)
- `NODE_ENV`: development or production

## Mobile App Strategy (Capacitor Android)

### Current Status
- Capacitor v7.4.4 already configured with Android platform
- Plugins: Geolocation, Camera enabled with proper permissions
- App config: `com.bluecycle.app` (BlueCycle)
- Build output: `dist/` directory

### Mobile Optimization Features
- **Responsive Design**: Mobile-first Tailwind CSS with touch-friendly buttons (min-h-9)
- **Viewport Meta Tags**: Safe area support, notch awareness (`viewport-fit=cover`)
- **Theme Color**: Teal (#16a88a) for Android status bar
- **Safe Touch Targets**: Minimum 44px height for all interactive elements
- **Storage**: localStorage for bank accounts and driver preferences
- **Features**: GPS tracking (Geolocation), Photo capture (Camera), Real-time pickup tracking

### Building Android APK
```bash
# 1. Build web assets
npm run build

# 2. Sync to Android platform
npx cap sync android

# 3. Build APK (from android/ directory)
cd android && ./gradlew assembleDebug

# Or release APK
cd android && ./gradlew assembleRelease
```

### Mobile-First Design Principles Applied
- Generous spacing for touch interactions (p-6, p-8)
- Large readable fonts for outdoor use
- High contrast teal accent colors for visibility
- Simplified navigation with bottom nav (suitable for mobile)
- Modal dialogs instead of page overlays
- Optimized for 360px-480px minimum widths (older Android devices)