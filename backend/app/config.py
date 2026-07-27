"""Application configuration via environment variables."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "gastos-app"
    debug: bool = False

    # Database
    db_host: str = "localhost"
    db_port: int = 5432
    db_user: str = "gastos_user"
    db_password: str = "gastos_password"
    db_name: str = "gastos"
    database_url: Optional[str] = None  # overrides individual fields if set

    @property
    def db_url(self) -> str:
        if self.database_url:
            return self.database_url
        return f"postgresql+asyncpg://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    @property
    def db_url_sync(self) -> str:
        """Synchronous URL for Alembic (sync driver)."""
        return self.db_url.replace("+asyncpg", "")

    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/auth/google/callback"

    # JWT
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24h

    # CORS
    frontend_url: str = "http://localhost:8121"
    backend_internal_url: str = "http://localhost:8000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
