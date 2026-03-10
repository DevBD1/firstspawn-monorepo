from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve monorepo root .env (src/api/app/config.py -> ../../..)
_MONOREPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
_ROOT_ENV = _MONOREPO_ROOT / ".env"


class Settings(BaseSettings):
    API_ENV: str = "development"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_DATABASE_URL: str = (
        "postgresql+psycopg://firstspawn:firstspawn@localhost:5432/firstspawn"
    )
    API_REDIS_URL: str = "redis://localhost:6379/0"
    API_JWT_SECRET: str = "dev-only-secret-change-me"
    API_JWT_ISSUER: str = "firstspawn-api"
    API_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    API_REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    model_config = SettingsConfigDict(
        env_file=(".env", str(_ROOT_ENV)),
        env_file_encoding="utf-8",
        extra="ignore",
        env_prefix="",
    )


settings = Settings()
