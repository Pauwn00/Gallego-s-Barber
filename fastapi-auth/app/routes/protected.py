from fastapi import APIRouter, Depends
from app.models.user import User
from app.auth.dependencies import get_current_active_user

router = APIRouter()

@router.get("/protected")
def protected_route(current_user: User = Depends(get_current_active_user)):
    """Ruta protegida que requiere autenticación"""
    return {
        "message": f"¡Hola {current_user.username}! Esta es una ruta protegida.",
        "user_id": current_user.id,
        "user_email": current_user.email
    }

@router.get("/dashboard")
def user_dashboard(current_user: User = Depends(get_current_active_user)):
    """Dashboard del usuario (requiere autenticación)"""
    return {
        "title": "Dashboard del Usuario",
        "user": {
            "username": current_user.username,
            "email": current_user.email,
            "member_since": current_user.created_at.strftime("%Y-%m-%d")
        },
        "stats": {
            "total_logins": "Implementar conteo en el futuro",
            "last_login": "Implementar en el futuro"
        }
    }