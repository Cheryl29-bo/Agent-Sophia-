import asyncio

import httpx
import pytest
from fastapi import HTTPException
from pydantic import SecretStr, ValidationError

from app.api import research as research_api


def test_research_requires_api_key(monkeypatch):
    monkeypatch.setattr(research_api.settings, "tavily_api_key", None)

    with pytest.raises(HTTPException) as error:
        asyncio.run(research_api.research(research_api.ResearchRequest(query="career options")))

    assert error.value.status_code == 500
    assert error.value.detail == "TAVILY_API_KEY is not configured on the server"


def test_research_rejects_blank_api_key(monkeypatch):
    monkeypatch.setattr(research_api.settings, "tavily_api_key", SecretStr("  "))

    with pytest.raises(HTTPException) as error:
        asyncio.run(research_api.research(research_api.ResearchRequest(query="career options")))

    assert error.value.status_code == 500


def test_research_sends_query_to_tavily(monkeypatch):
    monkeypatch.setattr(research_api.settings, "tavily_api_key", SecretStr("test-key"))
    calls = {}

    class FakeResponse:
        def raise_for_status(self):
            pass

        def json(self):
            return {"answer": "Example answer"}

    class FakeClient:
        def __init__(self, timeout):
            calls["timeout"] = timeout

        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            return None

        async def post(self, url, headers, json):
            calls.update(url=url, headers=headers, payload=json)
            return FakeResponse()

    monkeypatch.setattr(research_api.httpx, "AsyncClient", FakeClient)
    result = asyncio.run(research_api.research(research_api.ResearchRequest(query="career options")))

    assert result == {"answer": "Example answer"}
    assert calls["url"] == research_api.TAVILY_URL
    assert calls["headers"]["Authorization"] == "Bearer test-key"
    assert calls["payload"]["query"] == "career options"
    assert calls["payload"]["max_results"] == 5


def test_research_hides_provider_error_details(monkeypatch):
    monkeypatch.setattr(research_api.settings, "tavily_api_key", SecretStr("test-key"))

    class FakeClient:
        def __init__(self, timeout):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            return None

        async def post(self, *_args, **_kwargs):
            response = httpx.Response(429, request=httpx.Request("POST", research_api.TAVILY_URL))
            raise httpx.HTTPStatusError("provider detail", request=response.request, response=response)

    monkeypatch.setattr(research_api.httpx, "AsyncClient", FakeClient)

    with pytest.raises(HTTPException) as error:
        asyncio.run(research_api.research(research_api.ResearchRequest(query="career options")))

    assert error.value.status_code == 502
    assert error.value.detail == "Research provider returned HTTP 429"


def test_research_query_validation():
    with pytest.raises(ValidationError):
        research_api.ResearchRequest(query="hi")
