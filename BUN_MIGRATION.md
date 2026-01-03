# Bun Migration Guide

This project has been migrated from Node.js to Bun runtime.

## Changes Made

### 1. Root Configuration
- Updated `package.json` to use `bun` as package manager
- Changed `engines` requirement from Node.js to Bun

### 2. Server (apps/server)
- Changed `start:prod` script from `node dist/main` to `bun dist/main`
- Updated `test:debug` to use Bun's inspector
- Removed `ts-node` dependency (Bun can run TypeScript natively)

### 3. Database Package (packages/database)
- Updated all Prisma scripts to use `bun --env-file` instead of `dotenv-cli`
- Changed seed script to use `bun` instead of `ts-node`
- Removed `dotenv-cli` and `ts-node` dependencies

## Installation

1. Install Bun (if not already installed):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

## Running the Project

### Development
```bash
bun run dev
```

### Production
```bash
bun run build
bun run start:prod
```

### Database Commands
```bash
# Generate Prisma client
bun run db:generate

# Run migrations
bun run db:migrate

# Seed database
bun run db:seed
```

## Benefits of Bun

1. **Faster**: Bun is significantly faster than Node.js for most operations
2. **Native TypeScript**: No need for `ts-node` - Bun runs TypeScript directly
3. **Built-in Tools**: Bun includes bundler, test runner, and package manager
4. **Better Performance**: Faster startup times and lower memory usage

## Notes

- Bun is compatible with most Node.js packages
- NestJS works well with Bun
- Prisma works with Bun (use `--bun` flag for Prisma CLI commands)
- Environment variables are loaded automatically from `.env` files when using `--env-file` flag

