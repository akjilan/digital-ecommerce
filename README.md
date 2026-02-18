# Digital E-Commerce Platform

A modern full-stack e-commerce platform built with **Next.js 16** (App Router) + **NestJS 11**, managed as a **pnpm workspace monorepo**.

## Stack

| Layer         | Technology                                     |
| ------------- | ---------------------------------------------- |
| Frontend      | Next.js 16 (App Router, React 19)              |
| Backend       | NestJS 11 (Express)                            |
| Auth          | JWT (passport-jwt + bcryptjs)                  |
| Styling       | Tailwind CSS v4 + shadcn/ui components         |
| Monorepo      | pnpm workspaces                                |
| Shared config | `packages/config` (tsconfig, eslint, prettier) |

## Project Structure

```
ecommerce-platform/
├── apps/
│   ├── web/          # Next.js frontend (port 3000)
│   └── api/          # NestJS backend (port 4000)
├── packages/
│   └── config/       # Shared tsconfig, eslint, prettier
├── infra/            # Docker, infrastructure
└── docs/             # Documentation
```

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

**API** — create `apps/api/.env`:

```env
PORT=4000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=<generate with command below>
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@example.com
```

Generate JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**Web** — create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Run development servers

```bash
# Both apps in parallel
pnpm dev

# Or individually
pnpm --filter @ecommerce/web dev    # http://localhost:3000
pnpm --filter @ecommerce/api dev    # http://localhost:4000
```

## Pages

| Route              | Description                 | Auth     |
| ------------------ | --------------------------- | -------- |
| `/`                | Home + featured products    | Public   |
| `/products`        | Product listing with search | Public   |
| `/products/[slug]` | Product detail              | Public   |
| `/auth/login`      | Sign in                     | Public   |
| `/auth/register`   | Create account              | Public   |
| `/profile`         | User profile + edit         | 🔒 Auth  |
| `/admin/users`     | User management table       | 🔒 Admin |
| `/admin/products`  | Products management         | 🔒 Admin |

## API Endpoints

### Auth

```bash
# Register (first user or ADMIN_EMAIL → admin role)
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'

# Get current user (protected)
curl http://localhost:4000/auth/me \
  -H "Authorization: Bearer <token>"
```

### Users

```bash
# Update profile (protected)
curl -X PATCH http://localhost:4000/users/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Updated"}'
```

### Products

```bash
# List products (public, supports ?q=search&page=1&limit=12)
curl http://localhost:4000/products

# Search
curl "http://localhost:4000/products?q=keyboard&page=1&limit=6"

# Get by slug (public)
curl http://localhost:4000/products/mechanical-keyboard-pro

# Create product (admin only)
curl -X POST http://localhost:4000/products \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"New Product","description":"...","price":99.99,"stock":50}'
```

### Admin

```bash
# List all users (admin only)
curl http://localhost:4000/admin/users \
  -H "Authorization: Bearer <admin-token>"
```

## Scripts

```bash
pnpm dev              # Run all apps in parallel
pnpm build            # Build all apps
pnpm lint             # Lint all apps
pnpm typecheck        # Typecheck all apps
pnpm format           # Format with prettier
pnpm clean            # Clean build artifacts
```

## Notes

- **Auth**: First registered user (or user with `ADMIN_EMAIL`) gets `admin` role
- **Data**: Products are seeded in-memory on API startup (15 demo products)
- **DB**: Swap `UsersService` and `ProductsService` in-memory stores for TypeORM/Prisma repositories
- **Token storage**: JWT stored in `localStorage` — swap to HttpOnly cookies for production
