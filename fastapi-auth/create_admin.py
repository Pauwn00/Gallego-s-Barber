from app.database.database import SessionLocal
from app.models.user import User
from app.auth.auth import get_password_hash

# Crear sesión de base de datos
db = SessionLocal()

# Credenciales del nuevo admin
username = "admin_panel"
email = "admin@barberia.com"
password = "admin123"

# Verificar si el usuario ya existe
existing_user = db.query(User).filter(
    (User.username == username) | (User.email == email)
).first()

if existing_user:
    print(f"El usuario '{username}' o email '{email}' ya existe")
    print(f"Puedes usar: Email: {existing_user.email}")
else:
    # Crear nuevo usuario admin
    hashed_password = get_password_hash(password)
    new_admin = User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        is_active=True
    )
    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    
    print("\n Usuario administrador creado exitosamente!\n")
    print("=" * 50)
    print("CREDENCIALES DEL PANEL DE ADMINISTRADOR")
    print("=" * 50)
    print(f"Email:     {email}")
    print(f"Contraseña: {password}")
    print("=" * 50)
    print("\nUsa estas credenciales para entrar al panel.")

db.close()
