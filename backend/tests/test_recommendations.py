from types import SimpleNamespace
from app.services.recommendations import score_job

def test_score_is_transparent_and_detects_skill_gaps():
    candidate = SimpleNamespace(skills=["SQL", "Excel"], preferred_roles=["Data Analyst"], preferred_locations=["Remote"], experience_level="Fresher", education="BSc Statistics")
    job = SimpleNamespace(required_skills=["SQL", "Excel", "Power BI"], title="Junior Data Analyst", location="Remote", experience_level="Entry-level", education_requirements="Any")
    result = score_job(candidate, job)
    assert 0 <= result["score"] <= 100
    assert result["score_type"] == "transparent_heuristic"
    assert result["matched_skills"] == ["excel", "sql"]
    assert result["missing_skills"] == ["power bi"]
