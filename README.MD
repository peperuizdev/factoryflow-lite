# FactoryFlow Lite — Django REST + React + JWT

Demo full-stack para **gestionar órdenes de trabajo e inspecciones** con:

* **Backend:** Django + Django REST Framework + SimpleJWT + drf-spectacular
* **Frontend:** React (Vite) + React Router + Tailwind + Axios (interceptor JWT)

---

## Índice

* [Arquitectura y carpetas](#arquitectura-y-carpetas)
* [Requisitos](#requisitos)
* [🚀 Quickstart (local)](#-quickstart-local)
* [Variables de entorno](#variables-de-entorno)
* [Backend (Django/DRF)](#backend-djangodrf)

  * [Modelos](#modelos)
  * [Autenticación JWT](#autenticación-jwt)
  * [Permisos](#permisos)
  * [Endpoints](#endpoints)
  * [Documentación API (Swagger)](#documentación-api-swagger)
  * [Admin](#admin)
  * [Migraciones](#migraciones)
* [Frontend (React/Vite)](#frontend-reactvite)

  * [Estructura y rutas](#estructura-y-rutas)
  * [Contexto de Autenticación](#contexto-de-autenticación)
  * [Servicios Axios](#servicios-axios)
  * [Páginas](#páginas)
* [Flujo (30s)](#flujo)
* [Workflow Git y commits](#workflow-git-y-commits)
* [Ideas de mejora](#ideas-de-mejora)

---

## Arquitectura y carpetas

```
factoryflow-lite/
├─ server/                     # Django + DRF + SimpleJWT
│  ├─ server_core/             # settings, urls, wsgi/asgi
│  ├─ workorders/              # app: modelos, serializers, viewsets, urls
│  ├─ manage.py
│  └─ .env                     # SECRET_KEY, DEBUG, etc.
│
└─ client/                     # Vite + React + Tailwind + Router + Axios
   ├─ src/
   │  ├─ components/           # Navbar, Footer, etc.
   │  ├─ layout/               # Layout con <Outlet/>
   │  ├─ pages/                # Home, Login, WorkOrders, WorkOrderDetail
   │  ├─ routes/               # AppRoutes, RequireAuth
   │  ├─ services/             # api.js (axios) + workorders.js + inspections.js
   │  ├─ context/              # AuthContext.jsx
   │  ├─ App.jsx, main.jsx, index.css
   │  └─ ...
   └─ vite.config.js
```

---

## Requisitos

* **Python 3.11+**
* **Node 18+** y **npm**
* **Git**

---

## 🚀 Quickstart (local)

### 1) Backend

```bash
cd server
python -m venv venv
# macOS/Linux:
source venv/bin/activate
# Windows (PowerShell):
# .\venv\Scripts\Activate.ps1

pip install -r requirements.txt
# crea el .env (ver sección "Variables de entorno")
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver  # http://127.0.0.1:8000
```

### 2) Frontend

```bash
cd client
npm install
# crea el .env (ver sección "Variables de entorno")
npm run dev  # http://localhost:5173
```

**Orden para probar:**

1. Entra a `http://127.0.0.1:8000/admin` y crea algunos **WorkOrders** / **Inspections** (o usa la UI luego).
2. En el frontend, ve a **/login**, inicia sesión con tu usuario de Django.
3. Entra a **/workorders** (listado con filtro y paginación), **crear/eliminar** órdenes.
4. Detalle en **/workorders/:id**: **editar** título/estación/estado y **crear inspecciones**.

---

## Variables de entorno

### Backend

Crea `server/.env` basándote en `server/.env.example`:

```bash
# Django settings
SECRET_KEY=your-secret-key-here
DEBUG=True

# Hosts permitidos
ALLOWED_HOSTS=127.0.0.1,localhost

# Orígenes permitidos para CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Orígenes permitidos para CSRF
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Database (opcional - si no se define, usa SQLite)
# DB_ENGINE=django.db.backends.postgresql
# DB_NAME=factoryflow
# DB_USER=postgres
# DB_PASSWORD=postgres
# DB_HOST=127.0.0.1
# DB_PORT=5432
```

### Frontend

Crea `client/.env`:

```bash
VITE_API_URL=http://127.0.0.1:8000/api/
```

Vite soporta `.env` de forma nativa sin necesidad de librerías adicionales. Las variables deben tener el prefijo `VITE_`.

---

## Backend (Django/DRF)

### Modelos

* **WorkOrder**: `title (str)`, `station (str)`, `status (OPEN|IN_PROGRESS|DONE)`, `created_at`.
* **Inspection**: `work_order (FK)`, `result (OK|FAIL)`, `notes (str|nullable)`, `created_at`.

### Autenticación JWT

* **SimpleJWT** emite tokens en `/api/auth/token/` (POST con `username`, `password`).
* El **frontend** guarda `access` en `localStorage` y lo envía como:

  ```
  Authorization: Bearer <access_token>
  ```
* DRF valida el token con `JWTAuthentication` en cada request protegida.

### Permisos

* Vistas protegidas con `IsAuthenticated` para escritura y lectura según lo que definiste (en demo: acceso autenticado para CRUD desde frontend).
* Admin Django requiere superusuario.

### Endpoints

```
# Auth (SimpleJWT)
POST /api/auth/token/           -> { access, refresh }
POST /api/auth/token/refresh/   -> { access }

# WorkOrders
GET    /api/workorders/         -> lista (con ?status=OPEN|IN_PROGRESS|DONE & ?page=N)
POST   /api/workorders/         -> crear
GET    /api/workorders/:id/     -> detalle
PATCH  /api/workorders/:id/     -> actualizar parcial (title, station, status)
DELETE /api/workorders/:id/     -> eliminar

# Inspections
GET    /api/inspections/        -> lista (con ?work_order=:id & ?page=N)
POST   /api/inspections/        -> crear
GET    /api/inspections/:id/    -> detalle
PATCH  /api/inspections/:id/    -> actualizar parcial
DELETE /api/inspections/:id/    -> eliminar
```

### Documentación API (Swagger)

La API está documentada automáticamente con **drf-spectacular**:

* **Swagger UI** (interfaz interactiva): http://127.0.0.1:8000/api/docs/
* **Schema OpenAPI** (JSON): http://127.0.0.1:8000/api/schema/

Desde Swagger UI puedes:
- Ver todos los endpoints disponibles
- Probar requests directamente desde el navegador
- Ver modelos de datos y sus campos
- Autenticarte con JWT usando el botón "Authorize"

La documentación se actualiza automáticamente al modificar modelos o serializers.

### Admin

```bash
python manage.py createsuperuser
# navega a http://127.0.0.1:8000/admin/
```

### Migraciones

* **`makemigrations`**: Django detecta cambios en modelos y crea archivos de migración (instrucciones para la BD).
* **`migrate`**: ejecuta esas migraciones contra la BD (crea tablas/columnas).

---

## Frontend (React/Vite)

### Estructura y rutas

* **Layout** con **Navbar/Footer** y un `<Outlet/>` para el contenido.
* Rutas (React Router v6):

  * `/` → **Home** (centrada, CTA contextual según sesión).
  * `/login` → form controlado, llama a `login()` del **AuthContext**.
  * `/workorders` → listado con **filtro por estado**, **paginación**, **crear** (inline) y **eliminar**.
  * `/workorders/:id` → **detalle** con **editar (PATCH)** y **crear inspecciones**.
* **RequireAuth** (guard): si no hay token, redirige a `/login` y guarda `state.from` para volver tras login.

### Contexto de Autenticación

* `AuthContext.jsx`:

  * `useState` para `user`, `token`, `loading`.
  * `useEffect` rehidrata `user` cuando cambia `token` (lee `localStorage`).
  * `login(username, password)`: POST a `/api/auth/token/`, guarda `access` en `localStorage` y estado.
  * `logout()`: limpia storage y estado.
* **Cómo explicarlo**: "Estado global sin prop-drilling. Persisto token y rehidrato al recargar. Interceptor Axios añade `Authorization` a cada request."

### Servicios Axios

* `api.js`: instancia Axios con `baseURL` desde variable de entorno (`VITE_API_URL`) e **interceptor de request** que añade el JWT si existe.
* `workorders.js`: `list/get/create/patch/delete` (filtros y paginación **en backend**).
* `inspections.js`: igual, con filtro `work_order=:id`.

### Páginas

* **Home**: texto corto + CTA (`/login` o `/workorders`) + tres tarjetas (Órdenes, Inspecciones, Seguridad).
* **Login**: formulario controlado (`useState`), maneja `loading` y `error`, redirige usando `useNavigate` al `from` o `/`.
* **WorkOrders**: filtro por estado, tabla, crear inline (estado inicial `OPEN`), eliminar con confirmación, paginación coherente con DRF.
* **WorkOrderDetail**: edita `title/station/status` (PATCH), lista inspecciones (filtrado **server-side**), crear inspección (optimistic update).

---

## Flujo (30s)

> "Monté una API en Django/DRF con JWT (SimpleJWT) para proteger el CRUD de órdenes e inspecciones. En React uso un AuthContext que persiste el token en `localStorage` y un interceptor Axios que lo añade a cada request. Protejo rutas con un guard que redirige a `/login` guardando `state.from`. El listado de órdenes tiene filtros y paginación **server-side**; el detalle permite **editar** título/estación/estado y **crear inspecciones**. Las creaciones/eliminaciones actualizan la UI en memoria para una UX fluida. La API está documentada automáticamente con Swagger UI."

---

## Workflow Git y commits

* Ramas:

  * `dev` → integración,
  * `feature/backend`,
  * `feature/frontend`.
* Convención de mensajes:

  * `feat: …` nuevas features,
  * `fix: …` correcciones,
  * `docs: …` documentación,
  * `style: …` estilos/UI,
  * `chore: …` tareas menores.

**Ejemplos:**

```bash
git commit -m "feat(auth): Axios instance with JWT interceptor and AuthContext login"
git commit -m "feat(frontend): WorkOrders UI with filter, pagination, create & delete"
git commit -m "feat(frontend): WorkOrder detail edit (PATCH) and inspections create"
git commit -m "feat(backend): add Swagger UI with drf-spectacular"
git commit -m "docs: add README with setup and interview notes"
```

---

## Ideas de mejora

* **Refresh token**: interceptor de **respuesta** que detecte 401 → intente `/auth/token/refresh/` → reintente la petición.
* **Roles/permissions** en DRF (p. ej., operadores vs. managers).
* **Tests**: DRF (APITestCase) y React (Vitest/RTL).
* **Docker** (compose para server+client).