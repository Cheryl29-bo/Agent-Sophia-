from app.models.entities import CandidateProfile, JobListing

WEIGHTS = {"skills": 0.40, "education": 0.15, "experience": 0.20, "location": 0.10, "role": 0.15}
LEVELS = {"Student": 0, "Fresher": 0, "Entry-level": 1, "Mid-level": 2, "Senior": 3}

def _norm(value: str) -> str:
    return " ".join(value.casefold().strip().split())

def score_job(candidate: CandidateProfile, job: JobListing) -> dict:
    candidate_skills = {_norm(s) for s in candidate.skills}
    required = {_norm(s) for s in job.required_skills}
    overlap = candidate_skills & required
    skill_score = len(overlap) / len(required) if required else 1.0
    role_score = 1.0 if any(_norm(r) in _norm(job.title) or _norm(job.title) in _norm(r) for r in candidate.preferred_roles) else 0.0
    location_score = 1.0 if any(_norm(x) in _norm(job.location) or _norm(job.location) in _norm(x) for x in candidate.preferred_locations) else 0.0
    c_level = LEVELS.get(candidate.experience_level, 0)
    j_level = LEVELS.get(job.experience_level, 0)
    experience_score = 1.0 if c_level >= j_level else (0.5 if j_level - c_level == 1 else 0.0)
    education_score = 1.0 if job.education_requirements.casefold() == "any" or _norm(job.education_requirements) in _norm(candidate.education) else 0.5
    components = {"skills": skill_score, "education": education_score, "experience": experience_score, "location": location_score, "role": role_score}
    total = round(sum(components[k] * WEIGHTS[k] for k in WEIGHTS) * 100)
    missing = sorted(required - candidate_skills)
    reasons = [f"{len(overlap)} of {len(required)} required skills match"]
    if role_score: reasons.append("matches a preferred role")
    if location_score: reasons.append("matches a preferred location")
    if experience_score == 1: reasons.append("experience level is compatible")
    elif experience_score == 0: reasons.append("experience level may be below the role requirement")
    return {"score": total, "explanation": "; ".join(reasons) + ".", "matched_skills": sorted(overlap), "missing_skills": missing, "components": {k: round(v * 100) for k, v in components.items()}, "score_type": "transparent_heuristic"}
