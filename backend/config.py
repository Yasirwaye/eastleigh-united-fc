import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
# (in production/Railway, variables come from environment directly)
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_file = os.path.join(project_root, '.env')
if os.path.exists(env_file):
    load_dotenv(env_file)

class Config:
    # SECRET_KEY - REQUIRED environment variable
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError('SECRET_KEY environment variable is required')

    # JWT configuration
    JWT_SECRET_KEY = SECRET_KEY  # Use same secret for JWT
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour

    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///eastleigh_academy.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # CORS configuration
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')

    # Rate limiting
    RATELIMIT_STORAGE_URI = os.environ.get('REDIS_URL', 'memory://')

    # Environment settings
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    DOCKER_ENV = os.environ.get('DOCKER_ENV', 'false').lower() == 'true'