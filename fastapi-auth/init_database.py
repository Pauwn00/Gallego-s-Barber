#!/usr/bin/env python3
"""
Script para inicializar la base de datos con todas las tablas necesarias
"""

import os
import sys

# Agregar el directorio del proyecto al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.database import engine, Base
from app.models.user import User
from app.models.appointment import Appointment

def init_database():
    """
    Crear todas las tablas en la base de datos
    """
    print("Creando tablas en la base de datos...")
    
    try:
        # Crear todas las tablas
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas creadas exitosamente:")
        print("   - users")
        print("   - appointments")
        
    except Exception as e:
        print(f"❌ Error al crear las tablas: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Inicializando base de datos para Gallego's Barbers")
    print("=" * 50)
    
    success = init_database()
    
    if success:
        print("=" * 50)
        print("✅ Base de datos inicializada correctamente")
        print("Ahora puedes ejecutar el servidor FastAPI:")
        print("   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload")
    else:
        print("=" * 50)
        print("❌ Error al inicializar la base de datos")
        sys.exit(1)