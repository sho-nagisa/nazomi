import uvicorn
from app.main import socket_app
from app.core.config import settings

if __name__ == "__main__":
    uvicorn.run(
        socket_app,
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
