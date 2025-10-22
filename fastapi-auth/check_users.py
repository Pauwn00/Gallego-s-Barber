import sqlite3

# Conectar a la base de datos
conn = sqlite3.connect('app/app.db')
cursor = conn.cursor()

# Obtener todos los usuarios
cursor.execute("SELECT id, username, email, created_at FROM users")
users = cursor.fetchall()

print("\n=== USUARIOS REGISTRADOS ===\n")
if users:
    for user in users:
        print(f"ID: {user[0]}")
        print(f"Username: {user[1]}")
        print(f"Email: {user[2]}")
        print(f"Registrado: {user[3]}")
        print("-" * 40)
else:
    print("No hay usuarios registrados")

conn.close()
