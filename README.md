# Digital E-Commerce Platform

A full-stack, production-ready e-commerce monorepo built with **Next.js**, **NestJS**, and **PostgreSQL**, managed with **pnpm workspaces**.

---

## 📁 Project Structure

```
ecommerce-platform/
├── apps/
│   ├── web/          # Next.js storefront (App Router)
│   └── api/          # NestJS REST/GraphQL backend
├── packages/
│   ├── config/       # Shared ESLint, TypeScript & Prettier configs
│   ├── ui/           # Shared React component library (future)
│   └── types/        # Shared TypeScript types & API contracts (future)
├── infra/
│   └── docker/       # Docker Compose, DB init scripts, local tooling
├── docs/             # Architecture decisions, API docs, runbooks
├── .env.example      # Environment variable template
├── package.json      # Root workspace manifest & scripts
└── pnpm-workspace.yaml
```

---

## 🚀 Getting Started

### Prerequisites

| Tool                    | Version |
| ----------------------- | ------- |
| Node.js                 | ≥ 20    |
| pnpm                    | ≥ 9     |
| Docker & Docker Compose | latest  |

### 1. Clone & install dependencies

```bash
git clone <repo-url> ecommerce-platform
cd ecommerce-platform
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your local values
```

### 3. Start infrastructure (DB, Redis, etc.)

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

### 4. Run all apps in development mode

```bash
pnpm dev
```

| App                  | URL                   |
| -------------------- | --------------------- |
| Storefront (Next.js) | http://localhost:3000 |
| API (NestJS)         | http://localhost:4000 |

---

## 🛠 Available Scripts

| Command          | Description                               |
| ---------------- | ----------------------------------------- |
| `pnpm dev`       | Start all apps in watch mode              |
| `pnpm build`     | Build all apps & packages                 |
| `pnpm lint`      | Lint all workspaces                       |
| `pnpm typecheck` | Type-check all workspaces                 |
| `pnpm format`    | Format all files with Prettier            |
| `pnpm clean`     | Remove all build artifacts & node_modules |

---

## 🏗 Tech Stack

### Storefront (`apps/web`)

- **Next.js 15** (App Router, RSC)
- **TypeScript**
- **Tailwind CSS**

### API (`apps/api`)

- **NestJS 10**
- **TypeScript**
- **TypeORM** + **PostgreSQL**
- **Redis** (caching / queues)
- **JWT** authentication

### Shared

- **pnpm workspaces** — monorepo management
- **ESLint** + **Prettier** — code quality
- **Docker Compose** — local infrastructure

---

## 📄 License

MIT
