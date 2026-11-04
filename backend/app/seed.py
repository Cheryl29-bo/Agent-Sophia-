from datetime import date, timedelta
from app.core.database import Base, engine, SessionLocal
from app.models.entities import JobListing

SAMPLES = [
 dict(title="Junior Data Analyst", company="Northstar Analytics", description="Support reporting, clean datasets and build dashboards for business teams.", required_skills=["SQL", "Excel", "Power BI"], experience_requirements="0–2 years", experience_level="Entry-level", education_requirements="Bachelor's degree or equivalent", location="Remote", employment_type="Full-time", application_url="https://example.com/jobs/data-analyst", source="Sophia sample dataset", posting_date=date.today(), is_sample=True),
 dict(title="Marketing Associate", company="BrightPath Studio", description="Coordinate campaigns, analyse performance and support content planning.", required_skills=["Digital Marketing", "Analytics", "Content Strategy"], experience_requirements="0–2 years", experience_level="Entry-level", education_requirements="Any", location="Lagos, Nigeria", employment_type="Full-time", application_url="https://example.com/jobs/marketing-associate", source="Sophia sample dataset", posting_date=date.today()-timedelta(days=2), is_sample=True),
 dict(title="Python Backend Developer", company="Cloudframe Labs", description="Build and maintain API services using Python and relational databases.", required_skills=["Python", "FastAPI", "PostgreSQL", "Git"], experience_requirements="1–3 years", experience_level="Entry-level", education_requirements="Computer Science or related field", location="Hybrid – Abuja", employment_type="Full-time", application_url="https://example.com/jobs/python-backend", source="Sophia sample dataset", posting_date=date.today()-timedelta(days=4), is_sample=True),
]

def seed():
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if db.query(JobListing).count() == 0:
            db.add_all(JobListing(**item) for item in SAMPLES); db.commit()
if __name__ == "__main__": seed()
