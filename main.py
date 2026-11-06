from fastapi import FastAPI
from research import router as research_router

app = FastAPI(
    title="SOPHIA Research API",
    description="Web research endpoint powered by Tavily",
    version="1.0.0",
)

app.include_router(research_router, prefix="/api", tags=["Research"])

@app.get("/health")
async def health():
    return {"status": "ok"}
