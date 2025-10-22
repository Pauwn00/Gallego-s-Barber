# Panel de Administrador - Barbería

Panel web de administración para gestionar reservas y usuarios de la aplicación móvil de barbería.

## Características

- 🔐 **Login seguro** - Autenticación con JWT
- 📅 **Gestión de reservas** - Ver todas las citas de todos los usuarios
- 👥 **Gestión de usuarios** - Lista completa de usuarios registrados
- 🗓️ **Calendario interactivo** - Vista de reservas por mes y día
- 📊 **Estadísticas** - Servicios más populares y horarios más solicitados
- 🎨 **Diseño responsive** - Funciona en desktop, tablet y móvil

## Instalación y Uso

### 1. Requisitos previos

- Backend FastAPI corriendo en `http://localhost:8000`
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

### 2. Iniciar el panel

**Opción A: Servidor local simple con Python**

```bash
cd admin-panel
python -m http.server 8080
```

**Opción B: Servidor local con Node.js**

```bash
cd admin-panel
npx http-server -p 8080
```

**Opción C: Abrir directamente**
Simplemente abre el archivo `index.html` en tu navegador web.

### 3. Acceder al panel

Abre tu navegador y ve a:

```
http://localhost:8080
```

### 4. Iniciar sesión

Usa las mismas credenciales que utilizas en la app móvil:

- Email: tu email registrado
- Contraseña: tu contraseña

## Estructura del Proyecto

```
admin-panel/
├── index.html      # Estructura HTML del panel
├── styles.css      # Estilos y diseño visual
├── script.js       # Lógica JavaScript y llamadas a la API
└── README.md       # Este archivo
```

## Funcionalidades del Panel

### 📅 Pestaña Reservas

- Ver todas las reservas de todos los usuarios
- Filtrar por fecha específica
- Ver detalles: hora, cliente, servicio, notas
- Estadísticas de citas totales y del día

### 👥 Pestaña Usuarios

- Lista completa de usuarios registrados
- Ver email, nombre de usuario y fecha de registro
- Contador de citas por usuario
- Búsqueda rápida de usuarios

### 🗓️ Pestaña Calendario

- Vista de calendario mensual
- Días con citas marcados visualmente
- Navegación entre meses
- Al hacer clic en un día, ver todas sus citas con detalles completos

### 📊 Pestaña Estadísticas

- Gráfico de servicios más solicitados
- Gráfico de horarios más populares
- Ayuda a identificar tendencias y optimizar recursos

## Conexión con el Backend

El panel se conecta a los siguientes endpoints de la API:

- `POST /api/v1/token` - Login de administrador
- `GET /api/v1/users/me` - Información del usuario actual
- `GET /api/v1/admin/users` - Obtener todos los usuarios
- `GET /api/v1/appointments/admin/all-appointments` - Obtener todas las citas

## Configuración

Si tu backend está en una dirección diferente, modifica la variable `API_BASE_URL` en `script.js`:

```javascript
const API_BASE_URL = "http://tu-servidor:puerto/api/v1";
```

## Seguridad

- El token JWT se guarda en `localStorage` del navegador
- Todas las peticiones incluyen el header `Authorization: Bearer {token}`
- El token persiste entre sesiones (hasta que hagas logout)

## Personalización

### Cambiar colores

Edita las variables CSS en `styles.css`:

```css
:root {
  --primary-color: #e63946; /* Color principal */
  --secondary-color: #457b9d; /* Color secundario */
  --dark-bg: #1d3557; /* Fondo oscuro */
  /* ... más variables ... */
}
```

### Cambiar logo o título

Edita el HTML en `index.html`:

```html
<h1>🪒 Tu Barbería Admin</h1>
```

## Solución de Problemas

### Error de CORS

Si ves errores de CORS en la consola:

1. Verifica que el backend FastAPI tenga CORS habilitado
2. Asegúrate que `allow_origins=["*"]` esté configurado (o tu dominio específico)

### No se cargan las citas

1. Verifica que el backend esté corriendo
2. Verifica la URL en `API_BASE_URL`
3. Verifica que hayas iniciado sesión correctamente
4. Abre la consola del navegador (F12) para ver errores

### Token expirado

Si el token expira, simplemente cierra sesión y vuelve a iniciar sesión.

## Próximas Mejoras

- [ ] Sistema de roles (admin vs usuario normal)
- [ ] Editar y eliminar citas desde el panel
- [ ] Enviar notificaciones a usuarios
- [ ] Exportar reportes en PDF
- [ ] Ver historial de cambios
- [ ] Modo oscuro

## Tecnologías Utilizadas

- HTML5
- CSS3 (Grid, Flexbox, Variables CSS)
- JavaScript ES6+ (Async/Await, Fetch API)
- LocalStorage para persistencia
- FastAPI Backend

## Autor

Desarrollado como parte del proyecto de barbería con React Native y FastAPI.

## Licencia

Este proyecto es de uso educativo.
