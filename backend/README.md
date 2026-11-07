# SOPHIA API

FastAPI + SQLAlchemy backend for the first SOPHIA milestone. The API uses PostgreSQL and seeds clearly labelled fictional sample jobs.

## Run locally

1. Start PostgreSQL (from repository root): `docker compose up -d db`
2. `cd backend && python -m venv .venv`
3. Activate the environment, then `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and adjust `DATABASE_URL` if needed.
5. To enable web research, add your Tavily API key to `TAVILY_API_KEY` in `.env`. The research endpoint returns an error if no key is configured.
6. Seed sample jobs: `python -m app.seed`
7. Start API: `uvicorn app.main:app --reload`
8. API docs: http://localhost:8000/docs

## Tests
`pytest`

## API
- `POST /api/profiles` create candidate profile
- `GET /api/profiles/{id}` retrieve profile
- `GET /api/jobs` list listings
- `GET /api/recommendations/{profile_id}` ranked explainable recommendations
- `POST /api/profiles/{profile_id}/saved-jobs/{job_id}` save a job
- `GET /api/profiles/{profile_id}/saved-jobs` list saved jobs
- `POST /api/research` search the web through Tavily (requires `TAVILY_API_KEY`)

Recommendation score is a weighted, deterministic heuristic (skills 40%, education 15%, experience 20%, location 10%, role 15%). It is not an AI prediction. All seeded listings are fictional and have `is_sample=true`; their example.com application links are placeholders.
