# Smart Fit Backend

Backend de plataforma de salud y fitness con arquitectura hexagonal.

Sistema para ingesta de telemetría biométrica, gestión de estados de usuario y almacenamiento de insights generados. Construido con **NestJS + Prisma + Supabase (PostgreSQL)** siguiendo **Arquitectura Hexagonal (Puertos y Adaptadores)**.

---

## 📊 Estado Actual

El backend está en **desarrollo activo** y completamente funcional:
- ✅ Arquitectura hexagonal sólida implementada
- ✅ Persistencia en **Supabase (PostgreSQL 16)** con Prisma ORM
- ✅ Todos los módulos core implementados y testeados
- ✅ 93 tests unitarios y de integración pasando
- ✅ Validación de entrada robusta con class-validator/class-transformer
- ✅ Manejo de errores estructurado y respuestas HTTP consistentes
- ✅ Protección de rutas basada en roles y JWT

---

## 🏗️ Arquitectura Hexagonal (Ports & Adapters)

El backend sigue estrictamente la **Arquitectura Hexagonal** con dependencias hacia adentro:

```
┌──────────────────────────────────────────────┐
│  Presentation Layer (REST Controllers, DTOs)  │
└──────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────┐
│  Application Layer (Use Cases)                │
└──────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────┐
│  Domain Layer (Entities, Ports, Events)       │
└──────────────────────────────────────────────┘
                        ▲
                        │
┌──────────────────────────────────────────────┐
│  Infrastructure Layer (Prisma Adapters)       │
└──────────────────────────────────────────────┘
```

### Capas Explicadas

1. **Presentation Layer**: Controladores REST que manejan las peticiones HTTP, validan DTOs y devuelven respuestas.
2. **Application Layer**: Casos de uso que orquestan la lógica de negocio (crear insight, registrar telemetría, etc.).
3. **Domain Layer**: Entidades del dominio, interfaces de puertos (repositorios) y eventos de dominio.
4. **Infrastructure Layer**: Implementaciones concretas de los puertos usando Prisma y Supabase.

---

## 🧩 Módulos Implementados

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| **Auth** | ✅ Completo | Autenticación con Supabase (email/password y magic links), JWT, refresh tokens, guards de roles y autenticación |
| **User** | ✅ Completo | CRUD de perfiles de usuario (nombre, peso, altura, fecha de nacimiento, objetivo) |
| **HealthTelemetry** | ✅ Completo | Ingesta y almacenamiento de métricas biométricas (frecuencia cardíaca, presión arterial, peso, glucosa, horas de sueño, pasos) |
| **UserState** | ✅ Completo | Máquina de estados finita (FSM) para transiciones de estado de usuario (ej: sedentario → activo) |
| **AgentInsight** | ✅ Completo | Almacenamiento y flujo de validación de insights generados por IA (aprobar/rechazar) |

---

## ⚙️ Tecnologías Utilizadas

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| **Framework** | NestJS | 11.x |
| **Lenguaje** | TypeScript | 5.x |
| **ORM** | Prisma | 7.x |
| **Base de datos** | Supabase (PostgreSQL 16) | - |
| **Validación** | class-validator + class-transformer | - |
| **Testing** | Jest + Supertest | - |
| **Formato de código** | Prettier + ESLint | - |
| **Variables de entorno** | dotenv | - |

---

## 📋 Modelos de Datos (Prisma Schema)

Cuatro modelos principales en `prisma/schema.prisma`:

| Modelo | Propósito | Índices |
|--------|-----------|---------|
| `User` | Perfil de usuario atlético | `id` |
| `HealthTelemetry` | Métricas biométricas crudas | `userId`, `metricType`, `correlationId` |
| `UserState` | Historial de transiciones FSM | `userId`, `currentState` |
| `AgentInsight` | Insights con estado de validación | `userId`, `validationStatus` |

### Ejemplo de relaciones
- Un `User` tiene muchos registros en `HealthTelemetry`
- Un `User` tiene muchos registros en `UserState` 
- Un `User` tiene muchos `AgentInsight`

---

## 🔗 Configuración de Supabase

El proyecto utiliza **Supabase** como proveedor de PostgreSQL administrado:

### Proyecto Activo
- **Project ref:** `bvojmrveoppjoyucdfpd`
- **Región:** AWS US East 1
- **Extensiones habilitadas:** `pgvector` (para futuras capacidades de búsqueda semántica)
- **Migraciones aplicadas:** 
  1. `add_user_state` 
  2. `add_agent_insight`

### Conexiones Disponibles
| Tipo | Puerto | Uso |
|------|--------|-----|
| **Pooled (PgBouncer)** | `6543` | Conexiones de la aplicación en ejecución (optimizado para concurrencia) |
| **Direct** | `5432` | Operaciones de Prisma Migrate y administración directa |

> **Nota importante**: La aplicación usa el puerto **pooled (6543)** por defecto. Para ejecutar migraciones (`prisma migrate dev` o `prisma db push`), es necesario usar la conexión **directa (puerto 5432)**.

---

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── domain/            # Entidades, puertos, eventos del dominio
│   │   ├── entities/      # User, UserState, AgentInsight, etc.
│   │   ├── ports/         # Interfaces de repositorio (application/ports/out)
│   │   └── events/        # Eventos de dominio (UserRegistered, etc.)
│   ├── application/       # Casos de uso y lógica de negocio
│   │   └── use-cases/     # Servicios de aplicación (8 implementados)
│   ├── infrastructure/    # Adaptadores y configuración externa
│   │   └── persistence/   # Repositorios Prisma concretos
│   └── presentation/      # Capa de entrada (HTTP)
│       ├── controllers/   # Controladores REST
│       └── dtos/          # Objetos de transferencia de datos
├── prisma/
│   └── schema.prisma      # Schema de base de datos
├── test/                  # Tests E2E y de integración
└── .env                   # Variables de entorno (no versionado)
```

---

## 🧪 Cómo Ejecutar los Tests

### Tests Unitarios y de Integración
```bash
# Desde el directorio backend/
npm run test          # Ejecuta todos los tests (unitarios + integración)
npm run test:watch    # Modo watch durante desarrollo
npm run test:cov      # Genera reporte de cobertura
```

### Desglose de Tests
| Tipo | Framework | Qué se prueba |
|------|-----------|---------------|
| Unitarios | Jest | Entidades del dominio y use cases (lógica pura) |
| Integración | Jest | Repositorios Prisma (interacción con DB simulada) |
| Controladores | Supertest | Endpoints REST (validación, respuestas, auth) |

> **Resultado actual**: 93 tests pasando (0 fallos)

---

## ⚡ Scripts Disponibles

En `package.json`:

| Script | Descripción |
|--------|-------------|
| `npm run start` | Inicia el servidor en modo producción |
| `npm run start:dev` | Inicia el servidor en modo desarrollo con recarga automática |
| `npm run start:debug` | Inicia en modo debug con inspección habilitada |
| `npm run start:prod` | Inicia servidor compilado para producción |
| `npm run build` | Compila el proyecto TypeScript a JavaScript |
| `npm run format` | Formatea todo el código con Prettier |
| `npm run lint` | Ejecuta ESLint con autocorrección |
| `npm run test` | Ejecuta todos los tests |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:cov` | Tests con reporte de cobertura |

---

## 📋 Requisitos

- **Node.js** >= 20.x
- **npm** (viene con Node.js)
- **Cuenta en Supabase** (gratuita en [supabase.com](https://supabase.com))
- **PostgreSQL client** (opcional, para inspección directa de DB)

---

## 🚀 Inicio Rápido

```bash
# 1. Clonar repositorio y entrar al directorio backend
cd /ruta/al/proyecto/backend

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase:
# DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DB]?schema=public"
# SUPABASE_URL="https://[PROJECT_REF].supabase.co"
# SUPABASE_ANON_KEY="[ANON_KEY]"
# SUPABASE_SERVICE_ROLE_KEY="[SERVICE_ROLE_KEY]"
# PORT=3000 (opcional, default 3000)

# 3. Instalar dependencias
npm install

# 4. Sincronizar schema de base de datos (primer setup)
# Usando conexión directa (puerto 5432) para migraciones
npx prisma db push

# 5. Verificar que todo funciona
npm run test

# 6. Iniciar servidor en desarrollo
npm run start:dev

# El API estará disponible en http://localhost:3000
```

### 📝 Sobre el Archivo `.env`
El archivo `.env` debe contener:

```
# Conexión a Supabase (usar el pool por defecto para la app)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:6543/postgres"

# Credenciales de Supabase para autenticación
SUPABASE_URL="https://[PROJECT_REF].supabase.co"
SUPABASE_ANON_KEY="[ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE_ROLE_KEY]"

# Puerto del servidor (opcional)
PORT=3000
```

> **Obtener credenciales**: En tu dashboard de Supabase → Project Settings → API
> - **ANON_KEY**: clave pública para cliente
> - **SERVICE_ROLE_KEY**: clave de servicio con privilegios elevados (usada por el backend para operaciones admin)

---

## 📚 Recursos Adicionales

- [Documentación de NestJS](https://docs.nestjs.com)
- [Guía de Prisma ORM](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Arquitectura Hexagonal explicada](https://alistair.cockburn.us/Hexagonal+architecture)
- [planCompleto.md](https://github.com/mauroociappina/system-smart-fit/blob/main/planCompleto.md) - Visión arquitectónica completa
- [ROADMAP.md](https://github.com/mauroociappina/system-smart-fit/blob/main/ROADMAP.md) - Plan de desarrollo

---

## 👥 Equipo y Créditos

Desarrollado con ❤️ por el equipo de Smart Fit usando las mejores prácticas de arquitectura de software moderno.

**Licencia**: Este proyecto es privado y destinado únicamente para uso interno de Smart Fit.