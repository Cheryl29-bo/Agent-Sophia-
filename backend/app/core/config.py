from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://sophia:sophia@localhost:5432/sophia"
    cors_origins: str = "http://localhost:3000"
    tavily_api_key: SecretStr | None = None
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
