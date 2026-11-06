import os
import httpx

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

load_dotenv()

router = APIRouter()
TAVILY_URL = "https://api.tavily.com/search"


class ResearchRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=400)


@router.post("/research")
async def research(request: ResearchRequest):
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="TAVILY_API_KEY is not configured on the server",
        )

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "query": request.query,
        "search_depth": "advanced",
        "max_results": 5,
        "include_answer": True,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                TAVILY_URL,
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            return response.json()

    except httpx.HTTPStatusError as exc:
        # Do not expose provider response details or credentials to clients.
        raise HTTPException(
            status_code=502,
            detail=f"Research provider returned HTTP {exc.response.status_code}",
        ) from exc
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail="Could not connect to the research provider",
        ) from exc
