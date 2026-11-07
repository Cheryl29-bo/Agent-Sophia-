from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api.routes import router
from app.api.research import router as research_router

app = FastAPI(title="SOPHIA API", version="0.1.0", description="Candidate profiles, sample jobs and explainable job recommendations.")
app.add_middleware(CORSMiddleware, allow_origins=[x.strip() for x in settings.cors_origins.split(",")], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
Base.metadata.create_all(bind=engine)
app.include_router(router)
app.include_router(research_router)

@app.get("/health")
def health(): return {"status": "ok", "service": "sophia-api"}
