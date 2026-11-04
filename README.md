# SOPHIA — Initial Development Milestone

A separated Next.js/TypeScript/Tailwind frontend and Python/FastAPI/PostgreSQL backend for candidate profile creation, clearly labelled sample job listings, explainable recommendations, and saved jobs.

## Requirements
- Node.js 20+
- Python 3.11+
- Docker Desktop or a local PostgreSQL 16 server

## Start the database
From this directory run `docker compose up -d db`.

## Start the backend
```bash
cd backend
python -m venv .venv
# macOS/Linux: source .venv/bin/activate
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
cp .env.example .env  # Windows: copy .env.example .env
python -m app.seed
uvicorn app.main:app --reload
```
Open http://localhost:8000/docs for interactive API documentation.

## Start the frontend (second terminal)
```bash
cd frontend
npm install
cp .env.example .env.local  # Windows: copy .env.example .env.local
npm run dev
```
Open http://localhost:3000.

## Tests
From `backend`, run `pytest`. Tests use the pure scoring service and do not need a database.

## Recommendation logic
Weights: skills 40%, education 15%, experience 20%, location 10%, preferred role 15%. The API returns each component, a plain-language explanation, matched skills and missing skills. This is a transparent heuristic—not an AI-generated prediction. Eligibility checks and mandatory qualification gates are not implemented in this milestone.

## Sample data and safety
The three seeded jobs are fictional sample records, clearly marked `is_sample=true` and labelled in the UI. Their `example.com` application URLs are placeholders, not real application destinations. No live job scraping is performed.

## Current scope / later milestones
Supabase Auth, LangGraph orchestration, live job-source integrations, CV parsing, automated applications and deployment are intentionally deferred. Authentication is not enabled; this is a local development foundation, not production-ready for real candidate data.
