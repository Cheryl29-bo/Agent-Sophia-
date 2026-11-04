from pydantic import BaseModel, Field, ConfigDict

class ProfileCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=160)
    education: str = Field(min_length=2, max_length=240)
    skills: list[str] = Field(min_length=1, max_length=50)
    experience_level: str = Field(pattern="^(Student|Fresher|Entry-level|Mid-level|Senior)$")
    preferred_roles: list[str] = Field(min_length=1, max_length=20)
    preferred_locations: list[str] = Field(min_length=1, max_length=20)
    career_interests: list[str] = Field(default_factory=list, max_length=30)

class ProfileOut(ProfileCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)
