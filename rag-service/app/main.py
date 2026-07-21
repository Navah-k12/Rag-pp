from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.documents import router as documents_router
from app.routers.auth import router as auth_router


def create_app() -> FastAPI:
    app = FastAPI(title="StudyRAG Backend API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_router)
    app.include_router(documents_router)

    return app


app = create_app()
