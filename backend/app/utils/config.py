"""Application settings loaded from environment variables."""

import sys
from pydantic_settings import BaseSettings

_DEFAULT_SECRET = "changeme-use-a-strong-random-secret-in-production"


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://aquaride:aquaride@localhost:5432/aquaride"
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = _DEFAULT_SECRET
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    def __init__(self, **values):
        super().__init__(**values)
        # Prevent startup with the default insecure secret key in non-development environments.
        env = values.get("ENV", "development")
        if self.SECRET_KEY == _DEFAULT_SECRET and env == "production":
            print("ERROR: SECRET_KEY must be changed from the default value in production.", file=sys.stderr)
            sys.exit(1)

    class Config:
        env_file = ".env"


settings = Settings()
