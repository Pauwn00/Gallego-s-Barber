from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import engine, Base
from app.routes import auth, protected
from app.routers import appointments
from app.models import user, appointment  # Importar modelos para crear las tablas

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

# Crear la aplicación FastAPI
app = FastAPI(
    title="FastAPI Auth System",
    description="Sistema de autenticación con FastAPI, SQLite y JWT",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir las rutas
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(protected.router, prefix="/api/v1", tags=["Protected"])
app.include_router(appointments.router)

@app.get("/")
def read_root():
    """Endpoint de bienvenida"""
    return {
        "message": "¡Bienvenido al sistema de autenticación FastAPI!",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "signup": "/api/v1/signup",
            "login": "/api/v1/token",
            "user_info": "/api/v1/users/me",
            "protected": "/api/v1/protected",
            "dashboard": "/api/v1/dashboard",
            "appointments": "/api/v1/appointments"
        }
    }

@app.get("/health")
def health_check():
    """Verificación de salud del servicio"""
    return {"status": "OK", "message": "Servicio funcionando correctamente"}