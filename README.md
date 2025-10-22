# 🪒 Gallego's Barbers - Sistema de Reservas

Sistema completo de reservas para barbería con aplicación móvil (React Native), backend API (FastAPI) y panel de administración web.

## 📋 Características

- 📱 **App Móvil (React Native)**: Registro, login y reserva de citas
- 🔐 **Autenticación JWT**: Sistema seguro de autenticación
- 📅 **Sistema de Reservas**: Citas cada 30 minutos de 9:00 a 18:00
- 👨‍💼 **Panel de Administración**: Gestión completa de reservas y usuarios
- 📊 **Estadísticas**: Visualización de servicios y horarios más populares

## 🛠️ Tecnologías

### Backend

- Python 3.10
- FastAPI
- SQLAlchemy
- SQLite
- JWT Authentication
- Bcrypt

### Frontend Móvil

- React Native
- React Navigation
- AsyncStorage
- Axios & Fetch API
- react-native-calendars

### Panel Admin

- HTML5
- CSS3 (Grid, Flexbox)
- JavaScript ES6+
- LocalStorage

## 📁 Estructura del Proyecto

```
PROYECTO/
├── fastapi-auth/          # Backend API
│   ├── app/
│   │   ├── auth/         # Autenticación
│   │   ├── database/     # Configuración DB
│   │   ├── models/       # Modelos SQLAlchemy
│   │   ├── routers/      # Endpoints de citas
│   │   ├── routes/       # Endpoints de auth
│   │   └── schemas/      # Esquemas Pydantic
│   ├── main.py
│   └── requirements.txt
├── AuthMobileApp/         # App móvil React Native
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── screens/      # Pantallas de la app
│   │   ├── services/     # API y servicios
│   │   └── assets/       # Imágenes y recursos
│   └── package.json
└── admin-panel/           # Panel de administración
    ├── index.html
    ├── styles.css
    ├── script.js
    └── logo.png

```

## 🚀 Instalación y Uso

### 1. Backend (FastAPI)

```bash
cd fastapi-auth
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

El backend estará en: http://localhost:8000
Documentación API: http://localhost:8000/docs

### 2. App Móvil (React Native)

```bash
cd AuthMobileApp
npm install
npx react-native start
# En otra terminal:
npx react-native run-android
```

### 3. Panel de Administración

```bash
cd admin-panel
python -m http.server 8080
# O simplemente abre index.html en el navegador
```

Panel disponible en: http://localhost:8080

**Credenciales por defecto:**

- Email: admin@barberia.com
- Contraseña: admin123

## 📱 Funcionalidades de la App Móvil

- ✅ Splash Screen con logo
- ✅ Registro de usuarios
- ✅ Login con JWT
- ✅ Dashboard con próximas citas
- ✅ Calendario interactivo para reservar
- ✅ Selección de servicios (Corte de pelo, Peinado, etc.)
- ✅ Cancelación de citas
- ✅ Persistencia de sesión

## 👨‍💼 Panel de Administración

- ✅ Login seguro
- ✅ Vista de todas las reservas
- ✅ Gestión de usuarios
- ✅ Calendario mensual
- ✅ Estadísticas de servicios
- ✅ Diseño responsive

## 🔐 API Endpoints

### Autenticación

- `POST /api/v1/signup` - Registro de usuario
- `POST /api/v1/token` - Login
- `GET /api/v1/users/me` - Usuario actual

### Admin

- `GET /api/v1/admin/users` - Todos los usuarios
- `GET /api/v1/appointments/admin/all-appointments` - Todas las citas

### Citas

- `POST /api/v1/appointments/` - Crear cita
- `GET /api/v1/appointments/my-appointments` - Mis citas
- `GET /api/v1/appointments/availability/{date}` - Disponibilidad
- `DELETE /api/v1/appointments/{id}` - Cancelar cita

## 🎨 Diseño

El proyecto usa los colores corporativos de Gallego's Barbers:

- Rojo: #E63946
- Azul oscuro: #1D3557
- Fondo claro: #F1FAEE

## 📝 Base de Datos

SQLite con dos tablas principales:

- **users**: Usuarios del sistema
- **appointments**: Reservas de citas

## 🔧 Configuración

### Backend

Edita `fastapi-auth/app/database/database.py` para cambiar la conexión a DB.

### App Móvil

Edita `AuthMobileApp/src/services/api.js` para cambiar la URL del backend:

```javascript
const BASE_URL = "http://10.0.2.2:8000/api/v1"; // Para emulador
```

### Panel Admin

Edita `admin-panel/script.js` para cambiar la URL del backend:

```javascript
const API_BASE_URL = "http://localhost:8000/api/v1";
```

## 👨‍💻 Autor

Proyecto desarrollado para Gallego's Barbers

## 📄 Licencia

Este proyecto es de uso educativo.
