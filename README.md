# JX4 Paracotos - Fusión Web + Mobile

Repositorio completo para la plataforma JX4 Paracotos.

## Estructura del Proyecto

- `/src`: Aplicación Web (React + Vite)
- `/server.ts`: Servidor Backend (Express + Supabase Admin)
- `/mobile`: Aplicación Móvil (Expo / React Native)
- `/supabase_schema.sql`: Esquema de base de datos para Supabase

## Requisitos Previos

1. Cuenta en [Supabase](https://supabase.com)
2. Node.js v18+
3. Expo CLI (para móvil)

## Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz con las siguientes variables:

```env
SUPABASE_URL=https://brwnbcmoyncdcywrjpmh.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

## Instalación y Ejecución

### Web & Backend
```bash
npm install
npm run dev
```

### Móvil
```bash
cd mobile
npm install
npx expo start
```

## Seguridad y Roles

El sistema utiliza RLS (Row Level Security) en Supabase. Los roles disponibles son:
- `customer`: Cliente estándar.
- `admin`: Administrador total.
- `category_admin`: Gestiona productos de su categoría.
- `department_admin`: Gestiona productos de su departamento.
- `transport_admin`: Gestiona transportes y envíos.

Para invitar a un nuevo administrador, usa el endpoint:
`POST /api/invite-admin` (Requiere token de admin actual).

## Despliegue

- **Web**: Conectar repositorio a Vercel. Configurar variables de entorno.
- **Móvil**: Usar `eas build` para generar binarios de Android/iOS.
