# System Smart Fit

> Plataforma de salud y fitness con arquitectura hexagonal, event-driven y multi-agente IA. Backend NestJS + Frontend Next.js 15.

---

## 🚀 Quick Start

```bash
# 1. Clonar y entrar
git clone https://github.com/mauroociappinaph/System-Smart-Fit.git
cd System-Smart-Fit

# 2. Instalar dependencias (pnpm workspaces)
pnpm install

# 3. Configurar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Editar con credenciales de Supabase

# 4. Levantar base de datos (Supabase ya configurado)
# 5. Ejecutar tests
pnpm test

# 6. Desarrollo
pnpm --filter backend run start:dev  # Puerto 3001
pnpm --filter frontend run dev       # Puerto 3000
```

> **Frontend**: http://localhost:3000 | **Backend API**: http://localhost:3001

---

## 📦 Arquitectura del Monorepo

```
System-Smart-Fit/
├── backend/                 # NestJS 11 + Prisma + Supabase
│   ├── src/
│   │   ├── domain/          # Entidades, puertos, eventos
│   │   ├── application/     # Casos de uso (8 use-cases)
│   │   ├── infrastructure/  # Adapters Prisma/Supabase
│   │   └── presentation/    # Controllers REST + DTOs
│   └── prisma/schema.prisma
├── frontend/                # Next.js 15 + React 19 + Zustand
│   ├── src/
│   │   ├── app/             # App Router (public/private routes)
│   │   ├── components/      # AuthGuard, Navbar, Toast
│   │   ├── lib/             # Axios + API services
│   │   ├── stores/          # Zustand (auth, insights)
│   │   └── styles/          # Tailwind CSS 4
│   └── public/
├── pnpm-workspace.yaml      # Workspaces: backend + frontend
├── docker-compose.yml       # Dev stack (backend + frontend)
└── package.json             # Root workspace + Husky v9
```

---

## ✨ Features Implementadas

| Área | Feature | Estado |
|------|---------|--------|
| **Auth** | Login/Register JWT + Magic Links | ✅ |
| **Auth** | Refresh tokens + Role guards | ✅ |
| **Telemetría** | Ingesta biométrica (HR, BP, peso, glucosa, sueño, pasos) | ✅ |
| **FSM** | Máquina de estados usuario (sedentario → activo) | ✅ |
| **Insights** | Generación IA + validación approve/reject | ✅ |
| **Dashboard** | Lista insights + filtros + paginación | ✅ |
| **Telemetría Form** | Formulario biométrico + validación tiempo real | ✅ |
| **Tests** | 93 backend + 12 frontend passing | ✅ |

---

## 🛠 Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| **Backend** | NestJS + TypeScript | 11.x / 5.x |
| **Frontend** | Next.js + React | 15.x / 19.x |
| **Estado** | Zustand | 5.x |
| **DB** | Supabase (PostgreSQL 16) | - |
| **ORM** | Prisma | 7.x |
| **Estilos** | Tailwind CSS | 4.x |
| **Testing** | Jest + Vitest | - |
| **Package Manager** | pnpm | 10.x |

---

## 🧪 Testing

```bash
# Todos los tests
pnpm test

# Backend only
pnpm --filter backend run test
pnpm --filter backend run test:cov

# Frontend only
pnpm --filter frontend run test
pnpm --filter frontend run test:watch
```

| Proyecto | Tests | Cobertura |
|----------|-------|-----------|
| Backend | 93 | Domain 95% / App 85% |
| Frontend | 12 | Stores + Components |

---

## 🐳 Docker Development

```bash
# Build + up
docker compose up --build -d

# Logs
docker compose logs -f backend
docker compose logs -f frontend

# Down
docker compose down -v
```

**Servicios:**
- `backend`: http://localhost:3001
- `frontend`: http://localhost:3000
- Usa Supabase remoto (no DB local)

---

## 📁 Documentación

| Doc | Descripción |
|-----|-------------|
| [Backend README](backend/README.md) | Arquitectura hexagonal, módulos, API, setup |
| [Frontend README](frontend/README.md) | App Router, Zustand, Axios, testing, troubleshooting |
| [CHANGELOG](CHANGELOG.md) | Historial de versiones (Keep a Changelog) |
| [ROADMAP](ROADMAP.md) | 6 fases: Auth → Frontend → Infra → Events → IA → Multi-agent |
| [planCompleto.md](planCompleto.md) | Arquitectura completa: Hexagonal + Event-driven + Multi-agent IA |

---

## 🔧 Scripts Principales

| Comando | Descripción |
|---------|-------------|
| `pnpm install` | Instala deps en todos los workspaces |
| `pnpm test` | Tests en ambos workspaces |
| `pnpm lint` | Lint en ambos workspaces |
| `pnpm build` | Build en ambos workspaces |
| `pnpm --filter backend run start:dev` | Backend dev (watch) |
| `pnpm --filter frontend run dev` | Frontend dev (Turbopack) |

---

## 🔐 Variables de Entorno

### Backend (`backend/.env`)
```env
DATABASE_URL="postgresql://user:pass@host:6543/db?schema=public"
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="xxx"
SUPABASE_SERVICE_ROLE_KEY="xxx"
PORT=3001
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 📋 Próximos Pasos (ROADMAP)

| Fase | Objetivo | Estado |
|------|----------|--------|
| 1 | Auth + endpoints base | ✅ Done |
| 2 | Frontend MVP | ✅ Done |
| 3 | Infra: Husky + CI/CD + Scripts | 🔄 **En progreso** |
| 4 | Event Bus + Persistencia eventos | ⏳ |
| 5 | IA Integration (primera iteración) | ⏳ |
| 6 | Multi-agent + Memoria + Caching | ⏳ |

Ver [ROADMAP.md](ROADMAP.md) y [planCompleto.md](planCompleto.md) para detalle completo.

---

## 👥 Equipo

Desarrollado por el equipo Smart Fit con arquitectura hexagonal, event-driven y multi-agente IA.

---

## 📄 Licencia

Uso interno Smart Fit.