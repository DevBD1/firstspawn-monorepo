from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    API_ENV: str = "development"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/firstspawn"
    API_REDIS_URL: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        env_prefix="",  # Support both prefixed and legacy unprefixed vars
    )


settings = Settings()
