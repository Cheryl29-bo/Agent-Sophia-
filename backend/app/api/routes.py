from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.entities import CandidateProfile, JobListing, SavedJob
from app.schemas.profile import ProfileCreate, ProfileOut
from app.schemas.job import JobOut
from app.services.recommendations import score_job

router = APIRouter(prefix="/api")

@router.post("/profiles", response_model=ProfileOut, status_code=201)
def create_profile(payload: ProfileCreate, db: Session = Depends(get_db)):
    profile = CandidateProfile(**payload.model_dump())
    db.add(profile); db.commit(); db.refresh(profile)
    return profile

@router.get("/profiles/{profile_id}", response_model=ProfileOut)
def get_profile(profile_id: int, db: Session = Depends(get_db)):
    profile = db.get(CandidateProfile, profile_id)
    if not profile: raise HTTPException(404, "Candidate profile not found")
    return profile

@router.get("/jobs", response_model=list[JobOut])
def list_jobs(db: Session = Depends(get_db)):
    return db.query(JobListing).order_by(JobListing.posting_date.desc()).all()

@router.get("/recommendations/{profile_id}")
def recommendations(profile_id: int, db: Session = Depends(get_db)):
    profile = db.get(CandidateProfile, profile_id)
    if not profile: raise HTTPException(404, "Candidate profile not found")
    jobs = db.query(JobListing).all()
    results = [{"job": JobOut.model_validate(job).model_dump(mode="json"), **score_job(profile, job)} for job in jobs]
    return sorted(results, key=lambda x: x["score"], reverse=True)

@router.post("/profiles/{profile_id}/saved-jobs/{job_id}", status_code=201)
def save_job(profile_id: int, job_id: int, db: Session = Depends(get_db)):
    if not db.get(CandidateProfile, profile_id): raise HTTPException(404, "Candidate profile not found")
    if not db.get(JobListing, job_id): raise HTTPException(404, "Job not found")
    existing = db.query(SavedJob).filter_by(candidate_id=profile_id, job_id=job_id).first()
    if existing: return {"saved": True, "message": "Job already saved"}
    db.add(SavedJob(candidate_id=profile_id, job_id=job_id)); db.commit()
    return {"saved": True}

@router.get("/profiles/{profile_id}/saved-jobs", response_model=list[JobOut])
def saved_jobs(profile_id: int, db: Session = Depends(get_db)):
    if not db.get(CandidateProfile, profile_id): raise HTTPException(404, "Candidate profile not found")
    rows = db.query(SavedJob).options(joinedload(SavedJob.job)).filter_by(candidate_id=profile_id).all()
    return [row.job for row in rows]
