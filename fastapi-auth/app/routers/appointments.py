from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, time, timedelta

from app.database.database import get_db
from app.models import User, Appointment
from app.schemas.appointments import AppointmentCreate, AppointmentResponse
from app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/api/v1/appointments",
    tags=["appointments"]
)

# Definimos el horario de atención (9:00 a 18:00)
START_HOUR = 9
END_HOUR = 18
APPOINTMENT_DURATION = 30  # minutos

# Endpoint para crear una nueva cita
@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    appointment: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validar que la fecha y hora sean futuras
    now = datetime.now()
    appointment_datetime = datetime.combine(appointment.date, appointment.time)
    
    if appointment_datetime < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La cita debe ser en una fecha y hora futura"
        )
    
    # Validar que la hora esté dentro del horario de atención (9:00-18:00)
    hour = appointment.time.hour
    minute = appointment.time.minute
    
    if (hour < START_HOUR or hour >= END_HOUR or
        (hour == END_HOUR - 1 and minute > 30) or
        minute not in [0, 30]):  # Solo permitir reservas a la hora o a la media hora
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Las citas solo pueden ser de {START_HOUR}:00 a {END_HOUR}:00, cada 30 minutos"
        )
    
    # Verificar si ya existe una cita en ese horario
    existing_appointment = db.query(Appointment).filter(
        Appointment.date == appointment.date,
        Appointment.time == appointment.time
    ).first()
    
    if existing_appointment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este horario ya está reservado"
        )
    
    # Crear la nueva cita
    db_appointment = Appointment(
        user_id=current_user.id,
        date=appointment.date,
        time=appointment.time,
        service_type=appointment.service_type,
        notes=appointment.notes
    )
    
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    return db_appointment

# Endpoint para obtener todas las citas del usuario actual
@router.get("/my-appointments", response_model=List[AppointmentResponse])
def get_my_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    appointments = db.query(Appointment).filter(
        Appointment.user_id == current_user.id
    ).all()
    
    return appointments

# Endpoint ADMIN: obtener TODAS las citas de TODOS los usuarios
@router.get("/admin/all-appointments", response_model=List[AppointmentResponse])
def get_all_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # En producción, verificarías que el usuario es admin
    # Por ahora, cualquier usuario autenticado puede ver todas las citas
    appointments = db.query(Appointment).all()
    return appointments

# Endpoint para obtener disponibilidad de horarios para una fecha específica
@router.get("/availability/{date}")
def get_availability(
    date: str,  # Formato: YYYY-MM-DD
    db: Session = Depends(get_db)
):
    try:
        # Convertir el string de fecha a objeto date
        appointment_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de fecha incorrecto. Use YYYY-MM-DD"
        )
    
    # Validar que la fecha sea futura
    if appointment_date < datetime.now().date():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha debe ser futura"
        )
    
    # Obtener todas las citas para ese día
    booked_appointments = db.query(Appointment).filter(
        Appointment.date == appointment_date
    ).all()
    
    # Crear un set con las horas ya reservadas
    booked_times = {appointment.time for appointment in booked_appointments}
    
    # Generar todos los horarios disponibles (cada 30 minutos, de 9:00 a 18:00)
    available_slots = []
    
    for hour in range(START_HOUR, END_HOUR):
        for minute in [0, 30]:
            # Si es 18:00, no incluimos ese horario (solo hasta 17:30)
            if hour == END_HOUR - 1 and minute > 30:
                continue
            
            slot_time = time(hour=hour, minute=minute)
            
            # Si la fecha es hoy, solo mostrar horarios futuros
            if (appointment_date == datetime.now().date() and 
                datetime.combine(appointment_date, slot_time) <= datetime.now()):
                continue
            
            # Verificar si el horario no está ya reservado
            if slot_time not in booked_times:
                available_slots.append(
                    {
                        "time": slot_time.strftime("%H:%M"),
                        "available": True
                    }
                )
            else:
                available_slots.append(
                    {
                        "time": slot_time.strftime("%H:%M"),
                        "available": False
                    }
                )
    
    return {"date": date, "available_slots": available_slots}

# Endpoint para cancelar una cita
@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Buscar la cita
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()
    
    # Verificar si la cita existe
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cita no encontrada"
        )
    
    # Verificar si la cita pertenece al usuario actual
    if appointment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para cancelar esta cita"
        )
    
    # Verificar que la cita no haya pasado ya
    appointment_datetime = datetime.combine(appointment.date, appointment.time)
    if appointment_datetime < datetime.now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede cancelar una cita que ya ha pasado"
        )
    
    # Cancelar la cita (eliminar de la base de datos)
    db.delete(appointment)
    db.commit()
    
    return {"detail": "Cita cancelada correctamente"}