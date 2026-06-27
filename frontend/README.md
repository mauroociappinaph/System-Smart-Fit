# Smart Fit Frontend

Frontend de plataforma de salud y fitness construida con Next.js 15.

Interfaz de usuario para ingesta de telemetría biométrica, visualización de insights generados por IA y gestión de estados de usuario. Construida con **Next.js 15 + React 19 + Zustand + Tailwind CSS** consumiendo la API del backend de Smart Fit.

---

## 📊 Estado Actual

El frontend está en **desarrollo activo** y completamente funcional:
- ✅ Autenticación completa (login/register con validación de formularios)
- ✅ Panel de control con dashboard de insights
- ✅ Sistema de registro de telemetría biométrica
- ✅ Filtros de fecha e interacción con insights (aprobar/rechazar)
- ✅ Protección de rutas basada en estado de autenticación
- ✅ Estado global gestionado con Zustand
- ✅ Diseño responsivo con Tailwind CSS
- ✅ 12 tests unitarios pasando
- ✅ Integración completa con el backend mediante Axios

---

## 🧩 Características Implementadas

| Característica | Estado | Descripción |
|----------------|--------|-------------|
| **Autenticación** | ✅ Completo | Login/email-password, registro, proteción de rutas, refresh de tokens, cierre de sesión |
| **Panel de Insights** | ✅ Completo | Visualización de insights generados por IA con filtros por mes/rango de fechas, paginación, sistema de validación (aprobar/rechazar) |
| **Registro de Telemetría** | ✅ Completo | Formulario para registrar métricas biométricas (frecuencia cardíaca, presión arterial, peso, glucosa, horas de sueño, pasos) con validación en tiempo real |
| **Estado Global** | ✅ Completo | Gestión de estado de autenticación y insights mediante Zustand |
| **UI/UX** | ✅ Completo | Diseño responsivo, barra de navegación, guardas de autenticación, notificaciones toast, estados de carga y error |

---

## ⚙️ Tecnologías Utilizadas

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| **Framework** | Next.js | 15.x |
| **React** | React | 19.x |
| **Estado Global** | Zustand | 5.x |
| **Estilos** | Tailwind CSS | 4.x |
| **HTTP Client** | Axios | 1.x |
| **Form Validation** | React Hook Form + Yup (implícito en validaciones manuales) |
| **Iconos** | Heroicons (vía componentes SVG) |
| **Testing** | Vitest + React Testing Library | 4.x |
| **TypeScript** | TypeScript | 5.x |
| **Variables de Entorno** | dotenv | - |

---

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                  # Rutas de Next.js 15 (App Router)
│   │   ├── (public)/         # Rutas públicas (auth)
│   │   │   ├── login/        # Página de inicio de sesión
│   │   │   └── register/     # Página de registro
│   │   ├── (private)/        # Rutas protegidas (requieren auth)
│   │   │   ├── layout.tsx    # Layout común con AuthGuard y Navbar
│   │   │   └── (dashboard)/  # Dashboard principal
│   │   │       ├── layout.tsx
│   │   │   ├── insights/     # Página de lista de insights
│   │   │   │   └── page.tsx  # Listado con filtros, paginación y validación
│   │   │   └── telemetry/    # Página de registro de telemetría
│   │   │       └── page.tsx  # Formulario de métricas biométricas
│   │   └── layout.tsx        # Root layout (metadatos, fuentes, toast container)
│   ├── components/           # Componentes reutilizables
│   │   ├── auth-guard.tsx    # Protege rutas requiriendo autenticación
│   │   └── navbar.tsx        # Barra de navegación con user info y logout
│   ├── lib/                  # Librerías y configuraciones
│   │   ├── axios.ts          # Instancia de Axios con interceptors de auth
│   │   └── api/              # Funciones de servicio para endpoints
│   │       ├── auth.ts       # Login, register, getMe
│   │       ├── insights.ts   # Listar insights, validar insights
│   │       └── telemetry.ts  # Registrar métricas
│   ├── stores/               # Estado global con Zustand
│   │   ├── auth.store.ts     # Estado de autenticación (user, token, login/logout)
│   │   └── insights.store.ts # Estado de insights (lista, filtros, paginación)
│   └── styles/               # Estilos globales
│       └── globals.css       # Base styles y configuración de Tailwind
├── public/                   # Assets estáticos
│   └── favicon.ico
├── .env.local                # Variables de entorno (no versionado)
├── next.config.ts            # Configuración de Next.js
├── tailwind.config.mjs       # Configuración de Tailwind CSS
├── postcss.config.mjs        # Configuración de PostCSS
├── tsconfig.json             # Configuración de TypeScript
└── vitest.config.ts          # Configuración de Vitest
```

---

## 🔗 Configuración de Entorno

El frontend requiere una variable de entorno para conectarse al backend:

### Archivo `.env.local`
Crear este archivo en la raíz del frontend con:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

> **Nota**: El puerto `3001` es el puerto por defecto donde corre el backend de Smart Fit. Ajustar si el backend corre en otro puerto.

### Variables Disponibles
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL base del API del backend | `http://localhost:3001/api` |

---

## 📱 Rutas Implementadas

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Redirección automática a `/login` o `/insights` según auth state | Público |
| `/login` | Página de inicio de sesión con validación de formulario | Público |
| `/register` | Página de registro de nuevos usuarios | Público |
| `/insights` | Dashboard principal con lista de insights, filtros y paginación | Privado (requiere auth) |
| `/telemetry` | Formulario para registrar métricas biométricas | Privado (requiere auth) |

---

## 🛠️ Scripts Disponibles

En `package.json`:

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo en `http://localhost:3000` |
| `npm run build` | Compila la aplicación para producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta ESLint para linting de código |
| `npm run test` | Ejecuta todos los tests con Vitest |
| `npm run test:watch` | Ejecuta tests en modo watch durante desarrollo |

---

## 🧪 Cómo Ejecutar los Tests

```bash
# Desde el directorio frontend/
npm run test          # Ejecuta todos los tests
npm run test:watch    # Modo watch durante desarrollo
```

### Desglose de Tests
| Tipo | Framework | Qué se prueba |
|------|-----------|---------------|
| Unitarios | Vitest | Stores de Zustand (auth, insights) |
| Componentes | Vitest + React Testing Library | Componentes UI (AuthGuard, Navbar, formularios) |
| Integración | Vitest + RTL | Flujos de autenticación y navegación |

> **Resultado actual**: 12 tests pasando (0 fallos)

---

## 🚀 Inicio Rápido

```bash
# 1. Clonar repositorio y entrar al directorio frontend
cd /ruta/al/proyecto/frontend

# 2. Configurar variables de entorno
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
# Ajustar la URL si el backend corre en otro puerto

# 3. Instalar dependencias
npm install

# 4. Verificar que todo funciona con tests
npm run test

# 5. Iniciar servidor de desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:3000
```

### Flujo de Uso Esperado
1. Visitar `http://localhost:3000` → redirección automática a `/login`
2. Iniciar sesión con credenciales válidas (registrarse primero si es necesario)
3. Navegar entre `/insights` y `/telemetry` mediante la barra de navegación
4. Cerrar sesión desde el menú de usuario en la navbar

---

## 🔐 Flujo de Autenticación

1. **Login**: 
   - Envía credenciales a `/auth/login` endpoint del backend
   - Recibe JWT access token y refresh token (manejado por Supabase en backend)
   - Guarda token en `localStorage` y establece estado de usuario en Zustand store

2. **Protección de Rutas**:
   - `AuthGuard` componente verifica presencia de usuario en Zustand store
   - Si no hay usuario, redirige a `/login`
   - Si hay usuario pero token expirado, intenta refresh automático (manejo en backend)

3. **Manejo de Tokens**:
   - Interceptor en Axios agrega `Authorization: Bearer <token>` a todas las requests
   - Manejo automático de redirección a login en errores 401 (excepto en endpoints de auth)

4. **Cierre de Sesión**:
   - Elimina token de `localStorage`
   - Reinicia estado de Zustand store
   - Redirige a `/login`

---

## 📡 Integración con API

### Configuración de Axios (`src/lib/axios.ts`)
- Base URL: `process.env.NEXT_PUBLIC_API_URL`
- Timeout: 10 segundos
- Headers: `Content-Type: application/json`
- Interceptor de request: agrega token JWT desde `localStorage`
- Interceptor de response: maneja errores 401 (redirección a login excepto en endpoints auth)

### Servicios de API (`src/lib/api/`)
Cada archivo exporta funciones que envuelven endpoints específicos:

#### auth.ts
- `login(dto)`: POST `/auth/login`
- `signup(dto)`: POST `/auth/signup` 
- `getMe()`: GET `/auth/me`

#### insights.ts
- `list(userId, options)`: GET `/insights` con query params (filtros, paginación)
- `validate(id, dto)`: PATCH `/insights/{id}/validate`

#### telemetry.ts
- `submit(dto)`: POST `/telemetry`

---

## 🎨 Diseño y Experiencia de Usuario

### Principios de Diseño
- **Mobile First**: Diseñado inicialmente para móvil, adaptable a escritorio
- **Feedback Inmediato**: Estados de carga, éxito y error en todos los acciones asíncronas
- **Validación Proactiva**: Validación de formularios en tiempo real con mensajes claros
- **Accesibilidad**: Uso adecuado de elementos semánticos y atributos ARIA
- **Consistencia**: Paleta de colores, tipografía y espaciado uniforme

### Componentes Clave
- **AuthGuard**: Protege rutas redirigiendo a login cuando no hay sesión
- **Navbar**: 
  - Versión desktop: enlaces de navegación + info de usuario + botón logout
  - Versión mobile: menú hamburguesa con panel slide-in
- **Toasts**: Notificaciones temporales para éxito/error usando `react-hot-toast`
- **Form Controles**: Inputs, selects y botones con estilos consistentes y estados de loading/error

### Manejo de Estados
- **Carga**: Spinners y texto indicativo en acciones asíncronas
- **Error**: Mensajes amigables con opción de reintentar
- **Vacio**: Estados especiales cuando no hay datos para mostrar
- **Éxito**: Confirmación visual tras acciones completadas

---

## 📋 Requisitos

- **Node.js** >= 20.x
- **npm** (viene con Node.js)
- **Backend de Smart Fit** corriendo y accesible en la URL especificada en `.env.local`

---

## 🔧 Troubleshooting

### Problema: "Cannot connect to backend"
- Verificar que el backend esté corriendo en `http://localhost:3001`
- Confirmar que `NEXT_PUBLIC_API_URL` en `.env.local` apunte a la URL correcta
- Revisar la consola del navegador para errores de CORS o conexión

### Problema: "Redirect loop to login"
- Verificar que el token esté correctamente guardado en `localStorage`
- Confirmar que el endpoint `/auth/me` del backend devuelva datos válidos
- Limpiar `localStorage` y reiniciar sesión si persiste

### Problema: "Form validation not working"
- Revisar que los inputs tengan los atributos `name` correctos
- Verificar funciones de manejo de cambio en los componentes de formulario

---

## 📚 Recursos Adicionales

- [Documentación de Next.js 15](https://nextjs.org/docs/app)
- [Guía de Zustand](https://zustand-demo.pmndrs.com/)
- [Documentación de Tailwind CSS 4](https://tailwindcss.com/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Documentation](https://vitest.dev/guide/)
- [planCompleto.md](https://github.com/mauroociappina/system-smart-fit/blob/main/planCompleto.md) - Visión arquitectónica completa
- [ROADMAP.md](https://github.com/mauroociappina/system-smart-fit/blob/main/ROADMAP.md) - Plan de desarrollo

---

## 👥 Equipo y Créditos

Desarrollado con ❤️ por el equipo de Smart Fit usando las mejores prácticas de desarrollo frontend moderno.

**Nota**: Este frontend está diseñado para trabajar específicamente con el backend de Smart Fit. La compatibilidad con otros backends no está garantizada sin modificaciones.