# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevFit is a Next.js e-commerce application for customizable apparel (t-shirts, hoodies, tote bags). It uses:
- **Next.js 15** with App Router and Turbopack
- **Drizzle ORM** for database management with PostgreSQL
- **Supabase** as the database provider
- **shadcn/ui** for UI components
- **Biome** for linting and formatting
- **Tailwind CSS** for styling

## Development Commands

```bash
# Development
pnpm dev                 # Start dev server with Turbopack
pnpm build               # Build for production with Turbopack
pnpm start               # Start production server

# Code Quality
pnpm lint                # Run Biome linting
pnpm format              # Format code with Biome

# Database Operations
pnpm db:gen              # Generate Drizzle migrations
pnpm db:migrate          # Run migrations
pnpm db:push             # Push schema changes to database
pnpm db:pull             # Pull schema from database
NODE_ENV=development pnpm db:seed             # Seed database with sample data (requires env vars)
```

## Architecture

### Database Schema (`/db/schema/`)
The app uses a multi-table inventory management system:

- **Products**: Base product information (name, category, customizable areas)
- **Product Variants**: Specific SKUs with size, color, pricing (connected via productId)
- **Inventory**: Stock tracking with quantity on hand/reserved constraints
- **Inventory Reservations**: Cart/order reservations with expiration
- **Inventory Transactions**: Historical tracking of all inventory changes

Key relationships: Products → ProductVariants → Inventory/Reservations/Transactions

### Configuration
- **Environment**: Zod-validated config in `app-config.ts` manages Supabase credentials
  - Required env vars: `SB_DATABASE_URL`, `SB_ANON_KEY`, `SB_S3_SECRET_KEY`
- **Database**: Drizzle config points to `./db/schema` with PostgreSQL dialect
- **UI**: shadcn/ui configured with "new-york" style, Lucide icons, neutral base color
- **Seed Data**: `db/seed.ts` creates sample products, variants, and inventory (56 total variants)

### File Structure
- `/app/` - Next.js App Router pages and layouts
- `/db/` - Database schemas, migrations, and connection setup
- `/components/ui/` - shadcn/ui components
- `/lib/` - Utility functions

## Database Development

Always use the pnpm db:* commands for schema changes. The database uses check constraints for inventory validation (non-negative quantities, reserved ≤ on hand).

## Code Style

The project uses Biome with 2-space indentation and includes Next.js/React domain rules. Import organization is disabled.