# SOPHIA — Tavily FastAPI Research Service

This small FastAPI service adds a web-research endpoint to SOPHIA using the Tavily Search API.

## 1. Get a Tavily API key

Create an account and copy an API key from:

- https://tavily.com/
- https://app.tavily.com/

## 2. Configure the key

Copy `.env.example` to `.env` and replace the placeholder:

```env
TAVILY_API_KEY=your_real_tavily_api_key
```

Do not commit `.env` to GitHub. The `.gitignore` file excludes it.

## 3. Install and run locally

```bash
python -m venv .venv
```

Activate the environment, then:

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

Open the interactive API documentation:

- http://127.0.0.1:8000/docs

Health check:

- http://127.0.0.1:8000/health

## 4. Test the research endpoint

Send a `POST` request to `/api/research` with JSON:

```json
{
  "query": "Latest AI engineering jobs and required skills in Canada"
}
```

Example using curl:

```bash
curl -X POST "http://127.0.0.1:8000/api/research" \
  -H "Content-Type: application/json" \
  -d '{"query":"Latest AI engineering jobs and required skills in Canada"}'
```

A successful response returns Tavily's search response, including relevant results and source URLs.

## 5. Deploy on Vultr

1. Provision an Ubuntu server on Vultr.
2. Copy this project folder to the server.
3. Install Python and the dependencies in `requirements.txt`.
4. Create the server-side `.env` file and add the real Tavily key.
5. Run the app with a production process manager, for example:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

For production, place the service behind Nginx with HTTPS and run it under a process manager such as systemd. Configure firewall rules so only intended ports are exposed. Do not expose the `.env` file or API key.

## Integration note

This package provides the research endpoint only. It does not include an LLM. SOPHIA's FastAPI backend can pass the returned research results to the separately selected LLM for summarisation and career recommendations.
