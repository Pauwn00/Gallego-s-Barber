# Script para ejecutar el servidor de desarrollo
# Ejecutar desde la raíz del proyecto: python run.py

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        reload_dirs=["app"]
    )