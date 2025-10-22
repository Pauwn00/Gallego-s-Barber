from datetime import date, time, datetime
from typing import Optional, List
from pydantic import BaseModel

# Esquema para crear una cita
class AppointmentCreate(BaseModel):
    date: date
    time: time
    service_type: str
    notes: Optional[str] = None

# Esquema de respuesta para una cita
class AppointmentResponse(BaseModel):
    id: int
    user_id: int
    date: date
    time: time
    service_type: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Esquema para la disponibilidad de horarios
class TimeSlot(BaseModel):
    time: str
    available: bool

class AvailabilityResponse(BaseModel):
    date: str
    available_slots: List[TimeSlot]