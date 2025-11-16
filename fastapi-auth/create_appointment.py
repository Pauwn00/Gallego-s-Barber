"""
Script para crear una cita de prueba en la base de datos
"""
from datetime import datetime, date, time
from sqlalchemy.orm import Session
from app.database.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.appointment import Appointment

# Crear las tablas si no existen
Base.metadata.create_all(bind=engine)

def create_test_appointment():
    db = SessionLocal()
    try:
        # Buscar el usuario "Pau"
        user = db.query(User).filter(User.username.ilike("%Pau%")).first()
        
        if not user:
            print("❌ No se encontró un usuario con nombre 'Pau'")
            print("\n📋 Usuarios disponibles:")
            users = db.query(User).all()
            for u in users:
                print(f"  - ID: {u.id}, Username: {u.username}, Email: {u.email}")
            return
        
        print(f"✅ Usuario encontrado: {user.username} (ID: {user.id})")
        
        # Fecha y hora de hoy
        today = date.today()
        appointment_time = time(10, 30)  # 10:30 AM
        
        # Verificar si ya existe una cita en ese horario
        existing = db.query(Appointment).filter(
            Appointment.date == today,
            Appointment.time == appointment_time
        ).first()
        
        if existing:
            print(f"⚠️  Ya existe una cita para hoy a las {appointment_time}")
            print(f"   Usando horario alternativo: 14:00")
            appointment_time = time(14, 0)
        
        # Crear la cita
        new_appointment = Appointment(
            user_id=user.id,
            date=today,
            time=appointment_time,
            service_type="Corte de pelo",
            notes="Cita de prueba creada desde script"
        )
        
        db.add(new_appointment)
        db.commit()
        db.refresh(new_appointment)
        
        print(f"\n🎉 ¡Cita creada exitosamente!")
        print(f"   📅 Fecha: {new_appointment.date}")
        print(f"   🕐 Hora: {new_appointment.time}")
        print(f"   ✂️  Servicio: {new_appointment.service_type}")
        print(f"   👤 Cliente: {user.username}")
        print(f"   📧 Email: {user.email}")
        print(f"\n💡 Ahora puedes verla en el panel de administración")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("  CREAR CITA DE PRUEBA")
    print("=" * 60)
    create_test_appointment()
    print("=" * 60)
