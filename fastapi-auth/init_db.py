"""
Script para inicializar la base de datos y crear un usuario administrador
"""
from sqlalchemy.orm import Session
from app.database.database import SessionLocal, engine, Base
from app.models.user import User
from app.auth.auth import get_password_hash

def init_db():
    """Inicializar la base de datos"""
    print("Creando tablas de la base de datos...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas exitosamente")

def create_admin_user():
    """Crear un usuario administrador por defecto"""
    db = SessionLocal()
    try:
        # Verificar si ya existe un usuario admin
        admin_user = db.query(User).filter(User.username == "admin").first()
        if admin_user:
            print("⚠️  El usuario admin ya existe")
            return
        
        # Crear usuario admin
        hashed_password = get_password_hash("admin123")
        admin_user = User(
            username="admin",
            email="admin@example.com",
            hashed_password=hashed_password
        )
        
        db.add(admin_user)
        db.commit()
        print("✅ Usuario administrador creado exitosamente")
        print("   Username: admin")
        print("   Password: admin123")
        print("   Email: admin@example.com")
        
    except Exception as e:
        print(f"❌ Error creando usuario admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Inicializando base de datos...")
    init_db()
    create_admin_user()
    print("✨ Inicialización completada")