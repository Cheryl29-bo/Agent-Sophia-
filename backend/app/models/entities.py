from datetime import date, datetime
from sqlalchemy import String, Text, Date, DateTime, Integer, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"
    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(160))
    education: Mapped[str] = mapped_column(String(240))
    skills: Mapped[list] = mapped_column(JSON, default=list)
    experience_level: Mapped[str] = mapped_column(String(40))
    preferred_roles: Mapped[list] = mapped_column(JSON, default=list)
    preferred_locations: Mapped[list] = mapped_column(JSON, default=list)
    career_interests: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    saved_jobs: Mapped[list["SavedJob"]] = relationship(back_populates="candidate", cascade="all, delete-orphan")

class JobListing(Base):
    __tablename__ = "job_listings"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(180), index=True)
    company: Mapped[str] = mapped_column(String(180))
    description: Mapped[str] = mapped_column(Text)
    required_skills: Mapped[list] = mapped_column(JSON, default=list)
    experience_requirements: Mapped[str] = mapped_column(String(120))
    experience_level: Mapped[str] = mapped_column(String(40), default="Any")
    education_requirements: Mapped[str] = mapped_column(String(240), default="Any")
    location: Mapped[str] = mapped_column(String(180))
    employment_type: Mapped[str] = mapped_column(String(40))
    application_url: Mapped[str] = mapped_column(String(1000))
    source: Mapped[str] = mapped_column(String(180), default="Sample data")
    posting_date: Mapped[date] = mapped_column(Date)
    is_sample: Mapped[bool] = mapped_column(default=True)

class SavedJob(Base):
    __tablename__ = "saved_jobs"
    __table_args__ = (UniqueConstraint("candidate_id", "job_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    candidate_id: Mapped[int] = mapped_column(ForeignKey("candidate_profiles.id"))
    job_id: Mapped[int] = mapped_column(ForeignKey("job_listings.id"))
    saved_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    candidate: Mapped[CandidateProfile] = relationship(back_populates="saved_jobs")
    job: Mapped[JobListing] = relationship()
