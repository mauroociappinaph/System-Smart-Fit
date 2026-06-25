# System Smart Fit — Arquitectura de Sistemas y Plataforma Tecnológica Evolutiva de Salud y Fitness

> **Documento de Arquitectura de Software** — Versión 1.0
>
> Propuesta de diseño para una plataforma de salud y fitness basada en Arquitectura Hexagonal, Multi-Agent System, Event-Driven Core, e inferencia IA con NVIDIA NIM.

---

## Tabla de Contenidos

1. [Arquitectura General y Justificación Técnica](#1-arquitectura-general-y-justificación-técnica)
2. [Event-Driven Core y Máquina de Estados del Usuario](#2-event-driven-core-y-máquina-de-estados-del-usuario)
3. [Sistema Multi-Agente](#3-sistema-multi-agente)
4. [Arquitectura de Memoria del Sistema](#4-arquitectura-de-memoria-del-sistema)
5. [Estructura de Carpetas](#5-estructura-de-carpetas)
6. [Estrategia Completa de Testing](#6-estrategia-completa-de-testing)
7. [Automatización con Husky, Linters y Commits](#7-automatización-con-husky-linters-y-commits)
8. [GitHub Actions e Integración Continua](#8-github-actions-e-integración-continua)
9. [Base de Datos, Persistencia y pgvector](#9-base-de-datos-persistencia-y-pgvector)
10. [Seguridad y Autorización Defensiva](#10-seguridad-y-autorización-defensiva)
11. [Inteligencia Artificial (NVIDIA NIM)](#11-inteligencia-artificial-nvidia-nim)
12. [DevOps y Orquestación de Infraestructura](#12-devops-y-orquestación-de-infraestructura)
13. [Documentación Estándar de la Plataforma](#13-documentación-estándar-de-la-plataforma)
14. [Git Flow, Monorrepositorio y Proceso de Desarrollo](#14-git-flow-monorrepositorio-y-proceso-de-desarrollo)
15. [Hoja de Ruta Tecnológica (Roadmap)](#15-hoja-de-ruta-tecnológica-roadmap)
16. [Observabilidad Avanzada](#16-observabilidad-avanzada)
17. [Gobernanza de Calidad y Ciclo de Vida](#17-gobernanza-de-calidad-y-ciclo-de-vida)
18. [Matriz de Scripts y Automatización](#18-matriz-de-scripts-y-automatización)
19. [Gestión de Dependencias y Dependabot](#19-gestión-de-dependencias-y-dependabot)
20. [Sistema Avanzado de Razonamiento, Coherencia Multi-Agente y Evolución del Sistema](#20-sistema-avanzado-de-razonamiento-coherencia-multi-agente-y-evolución-del-sistema)

---

## 1. Arquitectura General y Justificación Técnica

La creación de una plataforma de salud y fitness altamente personalizada exige un diseño de software que garantice el desacoplamiento de las reglas de negocio frente a las constantes innovaciones de los dispositivos portátiles y los proveedores de modelos de lenguaje. La arquitectura propuesta se fundamenta en el patrón de **Arquitectura Hexagonal (Puertos y Adaptadores)** integrado en un entorno modular con inyección de dependencias nativa provista por el framework **NestJS** en el backend, y un diseño basado en características funcionales en el frontend con **Next.js**.

### 1.1 Diagrama Conceptual de Arquitectura

El flujo arquitectónico se organiza en círculos concéntricos de responsabilidad, asegurando que las dependencias lógicas fluyan exclusivamente hacia el núcleo de dominio:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Capa de Presentación (Web Next.js) <─> Controladores API (NestJS)  │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
          ┌──────────────────────────────────────────┐
          │  Puertos de Entrada (Application Use Cases│
          │  - Ingesta de Telemetría                  │
          │  - Procesamiento de IA                    │
          └──────────────────────────────────────────┘
                                   │
                                   ▼
                ┌──────────────────────────────────┐
                │  Núcleo de Dominio (Domain Core)  │
                │  - Entidades de Salud             │
                │  - Registro de Eventos Inmutables │
                │  - Reglas de Transición de Estados│
                └──────────────────────────────────┘
                                   ▲
                                   │
          ┌──────────────────────────────────────────┐
          │  Puertos de Salida (Interfaces del       │
          │  Entorno)                                 │
          │  - IEventPublisher                       │
          │  - IScalableRepository                   │
          │  - IAgentMemory                          │
          │  - INimInferenceClient                   │
          └──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Capa de Infraestructura (PostgreSQL/pgvector, Redis, NVIDIA NIM,   │
│  Event Bus)                                                         │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Justificación de Decisiones Técnicas

| Componente | Tecnología | Justificación |
|------------|-----------|---------------|
| **Backend** | NestJS + TypeScript | Soporte robusto para TypeScript, arquitectura modular nativa, inyección de dependencias desacoplada |
| **Frontend** | Next.js + TypeScript | Renderizado híbrido SSR/CSR, optimización de carga en paneles biométricos |
| **Base de Datos** | Supabase PostgreSQL + pgvector | Integridad relacional + búsqueda semántica vectorial |
| **Estado Global** | Zustand | Ligereza, mínima sobrecarga de renderizado |
| **IA** | NVIDIA NIM | Microservicios de inferencia optimizados, baja latencia en modelos MoE |

### 1.3 Aplicación de Principios de Ingeniería de Software

| Principio | Aplicación |
|-----------|-----------|
| **SRP** | Cada clase, caso de uso y agente asume una única responsabilidad operativa |
| **OCP** | Nuevos sensores de salud mediante adaptadores de salida, sin alterar el dominio |
| **LSP** | Cualquier adaptador alternativo (repositorio local, mock) puede sustituir al adaptador relacional |
| **ISP** | Puertos de infraestructura atómicos; un adaptador de solo lectura no implementa métodos de eliminación |
| **DIP** | El dominio interactúa solo con interfaces abstractas; NestJS inyecta implementaciones concretas |
| **DRY** | Fórmulas metabólicas, estimaciones de fatiga y normalizaciones definidas una vez en el dominio compartido |

### 1.4 Estrategias de Escalabilidad, Mantenibilidad y Observabilidad

- **Escalabilidad**: Procesamiento analítico desacoplado mediante colas de mensajería asíncronas. Particionamiento mensual de la tabla de telemetría. Índices HNSW sobre vectores de memoria a largo plazo.
- **Mantenibilidad**: Aislamiento absoluto del código de negocio respecto a frameworks externos. Tipado estricto de TypeScript en todo el monorrepositorio.
- **Observabilidad**: Correlation ID único en cada transacción biométrica. Telemetría operacional exportada mediante OpenTelemetry.

---

## 2. Event-Driven Core y Máquina de Estados del Usuario

### 2.1 Núcleo Dirigido por Eventos (Event-Driven Core)

La consistencia y la trazabilidad de la plataforma se apoyan en un **registro inmutable de eventos de dominio**. Cada cambio físico o analítico se notifica mediante un evento estructurado e inalterable, garantizando la consistencia eventual y la auditabilidad histórica del perfil de salud del usuario.

#### Propiedades de los Eventos de Dominio

| Propiedad | Descripción |
|-----------|-------------|
| **Inmutabilidad** | Una vez persistido, ningún dato puede ser alterado o eliminado |
| **Versionado Semántico** | Cada esquema de evento incorpora un prefijo de versión para evolucionar sin romper consumidores |
| **Idempotencia** | Identificadores únicos de evento + marcas de tiempo impiden duplicación en reintentos |
| **Correlation ID** | ID único de transacción propagado a través de todos los microservicios e inferencias |

#### Catálogo de Eventos de Dominio

| Nombre del Evento | Criterio de Emisión | Payload Conceptual |
|-------------------|---------------------|-------------------|
| **HealthDataRecorded** | Ingesta exitosa de métricas biométricas (pasos, ritmo cardíaco, saturación) | ID usuario, tipo métrica, valor, unidad, timestamp dispositivo, correlation ID, timestamp servidor |
| **WeightUpdated** | Nueva medición de peso y composición corporal desde balanza inteligente | ID usuario, peso, % masa grasa, % masa muscular, agua corporal total, correlation ID |
| **SleepAnalyzed** | Consolidación del bloque nocturno de sueño | ID usuario, duración total, fases (profundo, REM, ligero), HR promedio reposo, HRV |
| **InsightGenerated** | Recomendación personalizada aprobada por el ecosistema de agentes | ID usuario, ID insight, categoría (recuperación/estímulo), contenido textual, score confianza, correlation ID |
| **StagnationDetected** | Identificación de bloqueo adaptativo por 14 días continuos | ID usuario, métrica afectada (peso/rendimiento), período analizado, desviación estándar, correlation ID |
| **AlertTriggered** | Métricas biométricas fuera de límites de seguridad médica | ID usuario, severidad (precaución/crítico), anomalía detectada, valor infractor, recomendación clínica, correlation ID |

### 2.2 Máquina de Estados del Usuario

El perfil adaptativo del usuario se modela mediante una **Máquina de Estados Finita (FSM)** que determina el comportamiento del sistema de análisis de IA, adaptando la sensibilidad de los agentes y el tipo de recomendaciones sugeridas.

```
┌──────────────────────────────────────────────────────────────────┐
│                     MÁQUINA DE ESTADOS FINITA                     │
│                                                                  │
│            ┌────────────────> Idle <────────────────┐            │
│            │                    │                    │            │
│            │                    ▼                    │            │
│   Recovery Phase <─── Active Tracking ───> Risk Phase            │
│            ▲                    │                    ▲            │
│            │                    ▼                    │            │
│            └─────────── Improvement Phase            │            │
│            │                    │                    │            │
│            │                    ▼                    │            │
│            └─────────── Stagnation Phase             │            │
│                                    │                              │
│                                    └──────────────────────────────┘
└──────────────────────────────────────────────────────────────────┘
```

#### Reglas de Transición de Estados

| Transición | Condición |
|------------|-----------|
| **Idle → Active Tracking** | 5 días consecutivos de envío de telemetría biométrica |
| **Active Tracking → Improvement Phase** | Mejoras >5% intersemanal sostenidas |
| **Active Tracking → Stagnation Phase** | Progreso plano o negativo durante 14 días |
| **Active Tracking → Risk Phase** | AlertTriggered con severidad crítica (inmediato) |
| **Improvement Phase → Recovery Phase** | Caída sostenida de HRV nocturna durante 3 días |
| **Stagnation Phase → Improvement Phase** | Incrementos biométricos positivos sostenidos por 3 días |
| **Stagnation Phase → Recovery Phase** | Reporte subjetivo de fatiga extrema o desmotivación |
| **Risk Phase → Recovery Phase** | Estabilización de marcadores de riesgo en valores normales por ≥48h |
| **Recovery Phase → Active Tracking** | HRV y sleep scores reportan recuperación completa (o 7 días calendario automáticos) |

---

## 3. Sistema Multi-Agente

### 3.1 Taxonomía de Agentes

| Agente | Rol | Responsabilidad |
|--------|-----|-----------------|
| **Orchestrator Agent** | Control Central | Interceptar eventos, gestionar FSM, coordinar agentes especialistas, publicar resultados |
| **Health Data Agent** | Normalización | Filtrar telemetría cruda, corregir anomalías, estandarizar escalas métricas |
| **AI Insight Agent** | Insights | Generar recomendaciones personalizadas de fitness, descanso y nutrición |
| **Risk & Alert Agent** | Riesgos | Evaluar patrones de peligro biológico, emitir alertas de emergencia, forzar transiciones de estado |
| **Progress Analysis Agent** | Tendencias | Análisis temporal de largo alcance, adherencia, evolución de biomarcadores, detección de estancamiento |
| **Validation / Critic Agent** | Validación | Filtro final de control clínico y lógico, prevención de sugerencias lesivas o contradictorias |

### 3.2 Reglas de Coordinación e Interacción

- **Memoria Central Única**: Prohibición explícita de bases de datos o estados locales aislados. Todos operan sobre una memoria compartida jerárquica.
- **Coordinación vía Orchestrator**: Ningún agente especialista llama directamente a otro. El Orchestrator dirige exclusivamente el flujo.
- **Validación Cruzada Obligatoria**: Toda salida para el usuario final requiere aprobación del Validation / Critic Agent.
- **Control de Bucles Recursivos**:
  1. Límite máximo de **3 iteraciones** de corrección cruzada.
  2. Sin consenso → Orchestrator detiene el ciclo y reduce temperatura de inferencia a **0**.
  3. Si la discrepancia persiste → se descarta la recomendación IA y se emite guía pre-aprobada por profesionales de la salud.

### 3.3 Flujo Secuencial de Ejecución

```
[Datos de Sensores]
       │
       ▼
(1. Ingesta de Telemetría) ──> Evento HealthDataRecorded
       │
       ▼
(2. Normalización de Datos) <── Health Data Agent
       │
       ▼
[Event Bus]
       │
       ▼
[Orchestrator Agent] ──> (3. Análisis Paralelo)
       │
       ├──────────────────┬──────────────────┐
       ▼                  ▼                  ▼
Risk & Alert Agent  Progress Analysis   AI Insight Agent
(Evaluación de       (Cálculo de         (Generación de
 Peligros)            Tendencias)         Guía)
       │                  │                  │
       └──────────────────┴──────────────────┘
                          │
                          ▼
              (5. Auditoría de Seguridad)
              Validation Agent
                          │
                          ▼
              (6. Publicación del Insight)
              Orchestrator Agent ──> [Event Bus]
                          │
                          ▼
              (7. Despliegue en Panel del Usuario)
              [Frontend React]
```

---

## 4. Arquitectura de Memoria del Sistema

La memoria compartida actúa como la **única fuente de verdad** para los agentes, mitigando los problemas de fragmentación informativa mediante una estructura jerárquica.

### 4.1 Clasificación y Especificación de Capas de Memoria

| Capa | Equivalencia | Almacena | Implementación | Latencia |
|------|-------------|----------|---------------|----------|
| **Corto Plazo** | RAM del sistema | Telemetría últimas 24h, historial de sesión web, decisiones intermedias del Orchestrator | Redis | <5ms |
| **Medio Plazo** | Búfer de consolidación | Métricas agregadas semanales/mensuales, promedios de descanso, metas del usuario | PostgreSQL | — |
| **Largo Plazo** | Archivo secundario | Historial clínico, tendencias interanuales, embeddings de recomendaciones previas | PostgreSQL + pgvector (HNSW) | — |

### 4.2 Gestión de Acceso y Aislamiento de Información (Scopes)

| Dimensión | Restricciones | Propósito |
|-----------|--------------|-----------|
| **Per-User Scope** | Memoria cifrada, accesible solo para agentes de la sesión del usuario activo | Privacidad absoluta de registros de salud |
| **Per-Session Scope** | Datos efímeros descartados al finalizar el ciclo de decisión del Orchestrator | Espacio de trabajo limpio para cada comando/ingestión |
| **Global Scope** | Catálogos estáticos de entrenamiento, pautas de seguridad médica, plantillas de diseño | Marco conceptual de referencia común para todos los agentes |

---

## 5. Estructura de Carpetas

La arquitectura del monorrepositorio se diseña bajo un estricto principio de **modularidad y separación de responsabilidades**.

### 5.1 Frontend (Next.js)

```
frontend/
├── app/                # App Router (layouts, páginas, puntos de entrada)
├── components/         # Componentes UI reutilizables globalmente
├── features/           # Subcarpetas por funcionalidad de dominio
│   ├── telemetry/      #   Visualización de telemetría
│   ├── weight/         #   Gestión de peso
│   └── insights/       #   Visualización de recomendaciones
├── hooks/              # Custom hooks genéricos compartidos
├── services/           # Clientes API (NestJS, Supabase, terceros)
├── store/              # Zustand stores (segregados por contexto lógico)
├── types/              # Interfaces TypeScript del negocio
├── lib/                # Inicialización de librerías externas
├── utils/              # Funciones puras de utilidad global
├── constants/          # Valores estáticos inmutables
├── tests/              # Suites de pruebas
│   ├── unit/           #   Pruebas unitarias
│   ├── integration/    #   Pruebas de integración
│   └── e2e/            #   Playwright E2E
├── mocks/              # Datos sintéticos para desarrollo aislado
├── providers/          # Context providers de React
├── middleware.ts       # Validación JWT de sesión
└── config/             # Configuración general de Next.js
```

### 5.2 Backend (NestJS) — Arquitectura Hexagonal

```
backend/
├── domain/             # Núcleo puro de reglas de negocio (libre de frameworks)
│   ├── entities/       #   Clases con reglas esenciales del comportamiento biológico
│   ├── ports/          #   Interfaces abstractas de salida (repositorios, IA)
│   └── events/         #   Contratos estructurados de eventos inmutables
│
├── application/        # Capa intermedia de orquestación
│   ├── use-cases/      #   Flujos de negocio secuenciales
│   └── ports/          #   Interfaces de entrada (servicios expuestos)
│
├── infrastructure/     # Adaptadores concretos
│   ├── persistence/    #   Implementación de repositorios (Supabase)
│   └── inference/      #   Adaptador NVIDIA NIM
│
├── presentation/       # Controladores REST + DTOs de validación
├── shared/             # Utilidades transversales (interceptores, formateadores)
├── config/             # Variables de entorno y validación de esquemas
├── database/           # Migraciones y seeds
├── modules/            # Módulos NestJS (inyección de dependencias)
└── tests/              # Suites de pruebas
    ├── unit/           #   Pruebas unitarias
    ├── integration/    #   Pruebas de integración
    └── e2e/            #   Supertest API
```

### 5.3 Configuración de Herramientas

```
.husky/
├── pre-commit          # lint-staged (ESLint + Prettier en staged files)
├── commit-msg          # commitlint (validación Conventional Commits)
├── pre-push            # Pruebas unitarias + persistencia
└── _/                  # Scripts wrapper de inicialización

.github/workflows/
├── lint.yml            # ESLint + Prettier
├── frontend-tests.yml  # Unit + Zustand + Playwright
├── backend-tests.yml   # Unit + Repository Integration
├── build.yml           # Compilación TypeScript
└── deploy.yml          # Despliegue a producción
```

---

## 6. Estrategia Completa de Testing

### 6.1 Pirámide de Pruebas

#### Frontend

| Tipo | Herramienta | Alcance |
|------|-------------|---------|
| **Unit Tests** | Jest | Utilidades de cálculo, transformaciones de métricas, componentes puros |
| **Hooks Testing** | React Hooks Testing Library | Interacción con estado y ciclos de vida |
| **Zustand Testing** | Jest | Mutaciones deterministas del store |
| **Integration Tests** | Jest + Testing Library | Interacción entre componentes de una feature |
| **E2E Tests** | Playwright | Flujos completos de visualización y análisis en tiempo real |

#### Backend

| Tipo | Herramienta | Alcance |
|------|-------------|---------|
| **Unit Tests** | Jest | Entidades de dominio y casos de uso (sin dependencias externas) |
| **Repository Tests** | Jest + Supabase | Consultas y transacciones, mapeo correcto a entidades de dominio |
| **Service Tests** | Jest | Adaptadores de infraestructura, reintentos e interrupciones en APIs externas |
| **Controller Tests** | Supertest | Enrutamiento, validación de DTOs, respuestas HTTP |
| **E2E Tests** | Supertest | Secuencia completa: ingesta → evento → respuesta cognitiva |

### 6.2 Estructura del Directorio de Pruebas

```
tests/
├── unit/               # Pruebas unitarias rápidas (sin dependencias externas)
├── integration/        # Escenarios con BD en memoria o mocks
├── e2e/                # Pruebas completas (Playwright + Supertest)
├── mocks/              # Respuestas preestablecidas para APIs externas
└── setup.ts            # Inicialización global de Jest
```

### 6.3 Configuración de Jest y Umbrales de Cobertura

| Capa | Cobertura Mínima |
|------|-----------------|
| **Global** | 80% |
| **Domain Core** | 95% |
| **Application Layer** | 85% |

---

## 7. Automatización con Husky, Linters y Commits

### 7.1 Hooks de Husky

| Hook | Disparador | Acción |
|------|-----------|--------|
| `pre-commit` | `git commit` | lint-staged: ESLint + Prettier en staged files |
| `commit-msg` | Validación del mensaje | commitlint: auditoría de nomenclatura Conventional Commits |
| `pre-push` | `git push` | Suite rápida de pruebas unitarias y de persistencia |

### 7.2 Convención de Commits (Conventional Commits)

| Tipo | Uso |
|------|-----|
| `feat:` | Nueva funcionalidad (ej: adaptador de IA) |
| `fix:` | Corrección de fallo funcional |
| `docs:` | Cambios exclusivos en documentación |
| `style:` | Formateo visual sin cambio funcional |
| `refactor:` | Mejora de legibilidad sin nueva funcionalidad |
| `test:` | Adición o mejora de pruebas |
| `chore:` | Mantenimiento de configuración o dependencias |

---

## 8. GitHub Actions e Integración Continua

### 8.1 Diagrama del Pipeline

```
Trigger: Push o PR en rama protegida
         │
    ┌────┴────────────────────┐
    │         │               │
    ▼         ▼               ▼
lint.yml  frontend-tests.yml  backend-tests.yml
(ESLint)  (Jest + Playwright) (Jest + Supertest)
    │         │               │
    └────┬────┴───────────────┘
         ▼
   ┌─────────────┐
   │ Exitosos?   │
   └──────┬──────┘
       Sí ┴── No ──> Abortar + Alerta al equipo
          │
          ▼
     build.yml
  (Compilación TypeScript)
          │
          ▼
    deploy.yml (solo main)
  - Backend + Frontend
  - Migraciones Supabase
```

### 8.2 Detalle de Workflows

| Workflow | Acción |
|----------|--------|
| **lint.yml** | ESLint + Prettier global. Cancela el pipeline ante fallos estéticos o advertencias TypeScript |
| **frontend-tests.yml** | Pruebas de componentes, Zustand, hooks + Playwright E2E headless |
| **backend-tests.yml** | Contenedor NestJS + PostgreSQL efímera con pgvector. Pruebas unitarias y de repositorio |
| **build.yml** | Compilación estricta de artefactos TypeScript |
| **deploy.yml** | Despliegue automático en main. Migraciones secuenciales sobre Supabase |

### 8.3 Auditoría de Seguridad

- **Dependency Audit**: npm audit — bloquea el pipeline ante vulnerabilidades altas/críticas
- **SAST (CodeQL)**: Análisis estático preventivo en backend y frontend
- **Coverage Reports**: Publicación automática para auditar umbrales mínimos

---

## 9. Base de Datos, Persistencia y pgvector

### 9.1 Esquema Físico y de Relaciones

| Tabla | Atributos | Restricciones e Índices |
|-------|-----------|------------------------|
| **users** | id (UUID), email (VARCHAR), first_name (VARCHAR), activity_level (ENUM), created_at (TIMESTAMPTZ), is_deleted (BOOLEAN) | PK: id. Índice B-Tree único en email |
| **user_states** | id (UUID), user_id (UUID), current_state (VARCHAR), previous_state (VARCHAR), transitioned_at (TIMESTAMPTZ) | PK: id. FK: user_id → users(id). Índice B-Tree compuesto en (user_id, transitioned_at) |
| **health_telemetry** | id (UUID), user_id (UUID), metric_type (VARCHAR), value (NUMERIC), recorded_at (TIMESTAMPTZ), correlation_id (UUID) | PK: id. FK: user_id → users(id). Índice B-Tree compuesto (user_id, recorded_at) mensual. B-Tree en correlation_id |
| **agent_insights** | id (UUID), user_id (UUID), correlation_id (UUID), category (VARCHAR), content (TEXT), score (NUMERIC), validation_status (VARCHAR) | PK: id. FK: user_id → users(id). Índice B-Tree (user_id, validation_status) |
| **shared_memories** | id (UUID), user_id (UUID), memory_tier (VARCHAR), factual_data (TEXT), vector_embedding (VECTOR, 1536 dim) | PK: id. FK: user_id → users(id). Índice HNSW en vector_embedding (distancia coseno) |

### 9.2 Políticas de Migración, Auditoría y Soft Delete

- **Migraciones Secuenciales**: Alteraciones mediante migraciones incrementales con firmas temporales. Prohibidos cambios manuales en producción.
- **Campos de Auditoría**: `created_at` y `updated_at` en todas las tablas con triggers automáticos PostgreSQL.
- **Soft Delete**: Atributo `is_deleted`. Ocultación inmediata en consultas ordinarias. Depuración física irreversible tras plazos legales.

### 9.3 Optimización de Consultas Biométricas

- **Materialized Views**: Promedios semanales de fatiga, sueño y HRV precalculados y refrescados asíncronamente fuera de horas pico.
- **Table Partitioning**: `health_telemetry` particionada por rangos temporales mensuales.

---

## 10. Seguridad y Autorización Defensiva

### 10.1 Autenticación y Autorización de Sesión

| Mecanismo | Descripción |
|-----------|-------------|
| **JWT Dual Token** | Access token de 15 min (HttpOnly, Secure, SameSite=Strict). Refresh token de 7 días cifrado en Supabase |
| **Rotación de Refresh Tokens** | Invalidación automática de toda la cadena de sesión ante uso fraudulento |
| **RBAC** | Guards de NestJS que validan capacidades del JWT. Roles: usuario general, entrenador, auditor clínico |

### 10.2 Mitigación de Vulnerabilidades

| Medida | Configuración |
|--------|---------------|
| **Rate Limiting** | 100 llamadas/15 min por IP. 10 peticiones en rutas críticas de autenticación |
| **Helmet + CORS** | Cabeceras HTTP de seguridad. CORS restrictivo solo al dominio de Next.js en producción |
| **Zod Validation** | Validación estructural de payload en cada endpoint REST y consumidor de eventos |
| **Secret Management** | Vault o variables de entorno cifradas de Supabase. Prohibición absoluta de secrets en el código base |

---

## 11. Inteligencia Artificial (NVIDIA NIM)

### 11.1 Arquitectura de Inferencia

```
┌─────────────────────────────────────────┐
│   ADAPTADOR DE INFERENCIA (NestJS Core) │
└─────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
Nemotron-3-    Nemotron-3-     Nemotron-3-
Nano-30B       Super-120B      Ultra-550B
(Normalización) (Diálogos       (Validación
                Rápidos,         Clínica,
                Recomendaciones) Planificación)
    │               │               │
    └───────────────┴───────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │ Redis Semantic Cache │
         └─────────────────────┘
```

### 11.2 Modelos Seleccionados

| Modelo | Parámetros | Activos | Arquitectura | Uso |
|--------|-----------|---------|-------------|-----|
| **Nemotron-3-Ultra-550B** | 550B | 55B | Mamba-2 + MoE | Validación de alta seguridad (Validation/Critic Agent). Contextos de hasta 1M tokens |
| **Nemotron-3-Super-120B** | 120B | 12B | Mamba-Transformer MoE | Generación de interacciones conversacionales (AI Insight Agent) |
| **Nemotron-3-Nano-30B** | 30B | 3.2B | — | Normalización de telemetría, traducción, pre-procesamiento de alertas (Health Data Agent) |

### 11.3 Diseño de Prompts y Consistencia

- **Inyección Contextual**: Metas del usuario, restricciones de salud, edad, historial de alertas, variables demográficas.
- **JSON Structured Output**: Respuestas forzadas bajo esquemas JSON predefinidos.
- **Enable Thinking**: `chat_template_kwargs: { enable_thinking: true }` para análisis de contraindicaciones antes de redactar sugerencias.

### 11.4 Estrategias de Reducción de Costes y Continuidad

| Mecanismo | Descripción |
|-----------|-------------|
| **Semantic Caching** | Redis + búsqueda vectorial local. Respuestas cacheadas por 6h para consultas semánticamente equivalentes |
| **Exponential Backoff + Jitter** | Reintentos espaciados exponencialmente ante HTTP 429 de NVIDIA NIM |
| **Graceful Degradation** | Caída de Ultra-550B → redirección a Super-120B. Caída total → plantillas estáticas pre-aprobadas |

---

## 12. DevOps y Orquestación de Infraestructura

### 12.1 Entornos de Despliegue

| Entorno | Propósito | Configuración |
|---------|-----------|---------------|
| **Development** | Iteraciones ágiles locales | Docker Compose |
| **Staging** | Pruebas CI/CD pre-producción | Réplica exacta de producción |
| **Production** | Instancia crítica escalable multi-zona | Alta disponibilidad, cifrado en reposo, backups continuos |

### 12.2 Composición Docker Compose

| Contenedor | Función |
|------------|---------|
| **Next.js Application** | UI web con hot reload |
| **NestJS Server** | API REST + lógica hexagonal |
| **Supabase Local (PostgreSQL + pgvector)** | BD relacional con extensión vectorial + seeds |
| **Redis Server** | Memoria de corto plazo, sesiones, caché semántica |

### 12.3 Logs, Monitoreo y Respaldos

- **Logs JSON**: Todos los logs incluyen correlation ID para indexación rápida.
- **Alertas Tempranas**: Latencias NVIDIA NIM >10s en ventana de 5 min. Tasa de error HTTP 5XX >2%.
- **Backups**: Copias diarias automatizadas a almacenes externos. PITR habilitado.

---

## 13. Documentación Estándar de la Plataforma

### 13.1 Contenido del README.md

1. **Visión Técnica**: Propósito operativo, justificación del stack tecnológico
2. **Arquitectura y Diagramas**: Flujo hexagonal, FSM del usuario
3. **Quick Start**: Pasos de instalación y configuración de entorno
4. **Estructura de Carpetas**: Organización del monorrepositorio
5. **Políticas de Calidad**: Comandos de testing y cobertura
6. **Guía de Despliegue**: Workflows de GitHub Actions

### 13.2 Guías Operativas

| Guía | Contenido |
|------|-----------|
| **Onboarding Manual** | Registro en NVIDIA Build, contenedores Supabase locales, datos de entrenamiento simulados |
| **Feature Development Guide** | Declaración de use cases, registro de puertos, enlace de adaptadores |
| **Operations Book** | Transiciones seguras en producción, migraciones asíncronas, rollback inmediato |

### 13.3 Convenciones de Git

| Rama | Propósito |
|------|-----------|
| `main` | Producción (protegida contra escritura directa) |
| `develop` | Integración central de desarrollo |
| `feature/*` | Desarrollo de funcionalidades específicas |
| `hotfix/*` | Correcciones urgentes en producción |
| `release/*` | Preparación de pre-producción |

---

## 14. Git Flow, Monorrepositorio y Proceso de Desarrollo

### 14.1 Estrategia de Repositorio (Monorepo)

| Beneficio | Descripción |
|-----------|-------------|
| **Tipos Compartidos** | Interfaces biométricas y esquemas Zod compartidos entre frontend y backend |
| **Cambios Cruzados** | Único PR atómico para cambios que afectan cliente y servidor |
| **Estándares Unificados** | Husky, ESLint, Prettier, commitlint homogéneos en todo el código |

### 14.2 Estrategia de Ramas (Trunk-Based Development)

- Ramas `feature/*` de corta duración (≤48h hábiles).
- **Feature Flags**: Código incompleto integrado en develop bloqueado tras un flag de configuración.

### 14.3 Reglas de Protección de Ramas

- **Aprobaciones**: Mínimo 1 senior engineer.
- **Required Checks**: Todos los workflows de GitHub Actions deben pasar.
- **Cobertura Mínima**: Automatizada. Deniega integraciones que reduzcan umbrales.
- **Protección**: `git push --force` desactivado en ramas protegidas.

### 14.4 Pull Requests

- **Tamaño Máximo**: 300 líneas netas de cambio (excluyendo archivos de traducción o esquemas estáticos).
- **Checklist de PR**:
  - Descripción concisa + tarea del roadmap asociada
  - Pruebas unitarias e integración incorporadas
  - Arquitectura hexagonal respetada
  - Migraciones contemplan rollback

### 14.5 Desarrollo Incremental (Epics → Tasks)

```
Epic: Integración de Recomendaciones de IA
 └── Feature: Cliente de Inferencia NVIDIA NIM
      └── User Story: Generación de Insights Diarios de Fitness
           └── Task: Configuración de Cliente HTTP NestJS en Infraestructura
                └── Subtask: Manejo de Reintentos de Red en Adaptador
```

---

## 15. Hoja de Ruta Tecnológica (Roadmap)

| Fase | Funcionalidades | Deuda Técnica Aceptada | Optimizaciones Futuras |
|------|----------------|------------------------|----------------------|
| **MVP** | Ingesta manual de peso/calorías/pulso. FSM limitada (Idle, Active Tracking). Orquestador simple → Nemotron-3-Super-120B | Sin particionamiento. Sin caché semántica. Cobertura 75% | Persistencia relacional inicial. Cableado de DI en NestJS |
| **V1** | Sincronización con APIs de wearables. FSM completa. Sistema multi-agente completo. pgvector + HNSW | Pipeline secuencial. Logs locales no centralizados | Escalabilidad horizontal de NestJS |
| **V2** | Análisis conversacional multi-plataforma. Nemotron-3-Ultra-550B. HRV en tiempo real. Caché semántica Redis. Colas elásticas | Consistencia eventual relajada en móvil. Análisis lineal de estancamiento | Procesamiento asíncrono concurrente |
| **V3** | Simulación predictiva de composición corporal. Autoajuste adaptativo de prompts. Predicciones de susceptibilidad inmunológica | Modelos heredados en bus histórico | OpenTelemetry enriquecido. Motor de auto-tuning de agentes |

---

## 16. Observabilidad Avanzada

### 16.1 Logs Estructurados y Trazabilidad

- **Correlation ID**: Propaga desde el sensor/orquestador a todos los agentes especializados.
- **OpenTelemetry**: Integración con Jaeger/Zipkin para trazabilidad distribuida.
- **ATIF (Agent Trace Interchange Format)**: Telemetría de agentes formateada bajo estándar para auditabilidad paso a paso.

### 16.2 Métricas de Rendimiento Clave

| Categoría | Métricas |
|-----------|----------|
| **IA (NVIDIA NIM)** | TTFT (Time to First Token), tokens consumidos, hit rate de caché semántica, disponibilidad de microservicios |
| **Event Bus** | Tiempo de retención, tasa de consumo exitoso/fallido, latencia end-to-end |
| **Persistencia** | Latencia de consultas Supabase, velocidad de búsquedas pgvector, uso de conexiones |

### 16.3 Health Checks

Endpoint `/health` expone verificaciones automatizadas de:

- Conexión con PostgreSQL
- Disponibilidad de Redis
- Estado de comunicación con NVIDIA NIM

---

## 17. Gobernanza de Calidad y Ciclo de Vida

### 17.1 Definition of Done (DoD)

- [ ] TypeScript estricto compila sin advertencias
- [ ] ESLint + Prettier aprobados
- [ ] Suite de pruebas unitarias e integración sin regresiones
- [ ] Cobertura ≥80% global / ≥95% domain core
- [ ] Auditoría de dependencias sin vulnerabilidades altas/críticas
- [ ] Documentación actualizada (si aplica)

### 17.2 Checklists

#### Pull Request

- [ ] Commit semántico asignado
- [ ] Tarea del roadmap enlazada
- [ ] Eventos de dominio inmutables verificados
- [ ] Inyección de dependencias respeta aislamiento hexagonal

#### Release / Despliegue

- [ ] E2E tests extendidos en staging aprobados
- [ ] Esquema de rollback de migraciones verificado
- [ ] Disponibilidad operativa de NVIDIA NIM confirmada

---

## 18. Matriz de Scripts y Automatización

| Grupo | Comando | Objetivo | Impacto | Riesgo |
|-------|---------|----------|---------|--------|
| **Desarrollo** | `dev:infrastructure` | Levantar contenedores Docker (PostgreSQL, Redis) | Alto — inicio de jornada | Conflicto de puertos |
| **Calidad** | `lint:apply` | ESLint + Prettier global | Medio — mantenibilidad | Cambios menores excesivos en merge |
| **Testing** | `test:run:coverage` | Ejecutar pruebas + reportes de cobertura | Crítico — pre-despliegue | Alto consumo RAM |
| **Base de Datos** | `db:migrate:production` | Migraciones síncronas en Supabase | Crítico — consistencia de datos | Pérdida de telemetría sin rollback |
| **CI/CD** | `build:all:typescript` | Compilación estricta de artefactos TS | Alto — entrega continua | Bloqueo por tipos erróneos |
| **IA Engine** | `ai:cache:purge` | Limpiar caché semántica Redis | Medio — optimización de costes | Latencia temporal |
| **Monitoreo** | `telemetry:export:traces` | Verificar conectividad OpenTelemetry | Alto — diagnóstico producción | Sobrecarga de almacenamiento |

---

## 19. Gestión de Dependencias y Dependabot

### 19.1 Automatización con Dependabot

- **Escaneo Diario**: Análisis de archivos de empaquetado en busca de vulnerabilidades y actualizaciones.
- **PRs Grouping**: Agrupación de PRs por contexto (frontend, testing, linter) para evitar fatiga del equipo.

### 19.2 Flujo de Actualizaciones (SemVer)

| Tipo | Acción |
|------|--------|
| **Patch & Minor** | Fusión automática en develop si pasan builds y tests |
| **Major (Breaking Changes)** | Bloqueo contra fusión automática. Requiere análisis de ingenieros principales y planificación en roadmap |

---

## 20. Sistema Avanzado de Razonamiento, Coherencia Multi-Agente y Evolución del Sistema

### 20.1 Agentic Loop

```
Percepción → Procesamiento → Análisis de IA → Toma de Decisión
    ↑                                                    │
    │                                                    ▼
    └── Re-evaluación ←── Captura de Feedback ←── Output
```

1. **Percepción**: Captura de telemetría → bus de eventos inmutables
2. **Procesamiento**: Health Data Agent depura, normaliza, contextualiza
3. **Análisis de IA**: Orchestrator distribuye análisis en paralelo (AI Insight + Progress Analysis)
4. **Toma de Decisión**: Evaluación de transiciones de FSM basada en outputs de fatiga
5. **Output**: Insights grabados + dashboards y notificaciones actualizados
6. **Captura de Feedback**: Reacción del usuario monitorizada (completitud, descarte)
7. **Re-evaluación**: Feedback consolidado en memoria de medio plazo → ajuste dinámico de prompts

### 20.2 Evolución del Sistema Multi-Agente

| Fase | Descripción |
|------|-------------|
| **Fase 1 — Simple Estática** | NestJS procesa telemetría lineal contra un único modelo NIM. Sin interacción multi-agente ni memoria histórica |
| **Fase 2 — Reactivo Cooperativo** | 6 agentes especializados sobre memoria jerárquica L1-L3. Orchestrator dirige. Validation obligatorio |
| **Fase 3 — Auto-Optimizado Autónomo** | Bucles de autoajuste. Evaluación de impacto real en rendimiento del usuario. Ajuste proactivo de prompts |

### 20.3 Sincronización de Bus de Eventos y Máquina de Estados

- **Event Bus**: Autopista de comunicación desacoplada. El emisor no espera bloqueantemente el resultado analítico.
- **Event Consumers & Producers**: NestJS produce eventos inmutables. Los agentes se suscriben asíncronamente.
- **Replay System**: Capacidad de re-ejecutar telemetría histórica ante nuevas reglas clínicas o prompts refinados.
- **Consistencia Eventual Sólida**: Procesamiento asíncrono en segundo plano. Respuestas inmediatas en Next.js. Consistencia final en segundos.

### 20.4 Anti-Drift System

Cuatro salvaguardas contra la **deriva de agentes (Agentic Drift)**:

| Salvaguarda | Descripción |
|-------------|-------------|
| **Goal-Drift Score** | El Validation Agent calcula un índice de desviación de metas. Bloquea recomendaciones que contradicen directrices históricas (Goodhart's Law) |
| **Feedback Scoring Matrix** | Puntaje de utilidad dinámico basado en adherencia del usuario y respuesta biológica en 72h posteriores |
| **Policy as Code Guardrails** | Restricciones de seguridad críticas codificadas en TypeScript en la capa de dominio. Barreras infranqueables para outputs inseguros |
| **pass@k (k=3)** | Tres generaciones independientes ante decisiones complejas. El Validation Agent selecciona la opción con mayor consistencia y menor riesgo biológico |

---

> **Conclusión**: La combinación coherente de la arquitectura hexagonal, el procesamiento de telemetría inmutable dirigido por eventos, la orquestación elástica de microservicios de inferencia optimizados de NVIDIA NIM y las salvaguardas continuas contra la deriva de agentes, consolida una plataforma avanzada para el cuidado de la salud física y el fitness, garantizando escalabilidad, mantenibilidad y adaptabilidad a largo plazo en producción.