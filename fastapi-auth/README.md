# FastAPI Authentication System

Sistema de autenticación completo con FastAPI, SQLite y JWT.

## Características

- ✅ Registro de usuarios (signup)
- ✅ Login con JWT tokens
- ✅ Base de datos SQLite
- ✅ Autenticación segura con bcrypt
- ✅ Rutas protegidas
- ✅ Documentación automática con Swagger

## Instalación

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias:**

```bash
pip install -r requirements.txt
```

3. **Inicializar la base de datos:**

```bash
python init_db.py
```

4. **Ejecutar el servidor:**

```bash
python run.py
```

La aplicación estará disponible en: http://127.0.0.1:8000

## Documentación API

- **Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc

## Endpoints

### Públicos

- `GET /` - Página de bienvenida
- `GET /health` - Estado del servicio
- `POST /api/v1/signup` - Registro de usuario
- `POST /api/v1/token` - Login (obtener token)

### Protegidos (requieren autenticación)

- `GET /api/v1/users/me` - Información del usuario actual
- `GET /api/v1/protected` - Ruta protegida de ejemplo
- `GET /api/v1/dashboard` - Dashboard del usuario

## Uso

### 1. Registro de usuario

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

### 2. Login

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=testpassword123"
```

### 3. Acceso a rutas protegidas

```bash
curl -X GET "http://127.0.0.1:8000/api/v1/users/me" \
  -H "Authorization: Bearer <tu_token_aquí>"
```

## Usuario Administrador

El script `init_db.py` crea un usuario administrador por defecto:

- **Username:** admin
- **Password:** admin123
- **Email:** admin@example.com

## Estructura del Proyecto

```
fastapi-auth/
├── app/
│   ├── auth/           # Módulos de autenticación
│   ├── database/       # Configuración de base de datos
│   ├── models/         # Modelos SQLAlchemy y esquemas Pydantic
│   └── routes/         # Rutas de la API
├── main.py            # Aplicación principal
├── run.py             # Script para ejecutar el servidor
├── init_db.py         # Script para inicializar la base de datos
└── requirements.txt   # Dependencias
```

## Seguridad

- Las contraseñas se almacenan hasheadas with bcrypt
- Los tokens JWT tienen expiración configurable
- Las rutas protegidas verifican la autenticación
- CORS configurado (ajustar para producción)

## Desarrollo

Para hacer cambios al proyecto:

1. Modificar los archivos necesarios
2. El servidor se recarga automáticamente en modo desarrollo
3. La documentación se actualiza automáticamente

## Próximos pasos

- [ ] Roles y permisos de usuario
- [ ] Reset de contraseñas
- [ ] Verificación de email
- [ ] Rate limiting
- [ ] Logging
- [ ] Tests unitarios
