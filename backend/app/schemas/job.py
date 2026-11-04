from datetime import date
from pydantic import BaseModel, ConfigDict, HttpUrl

class JobOut(BaseModel):
    id: int
    title: str
    company: str
    description: str
    required_skills: list[str]
    experience_requirements: str
    experience_level: str
    education_requirements: str
    location: str
    employment_type: str
    application_url: str
    source: str
    posting_date: date
    is_sample: bool
    model_config = ConfigDict(from_attributes=True)
