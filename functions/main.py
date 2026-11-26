import os
import sys

# Add directory to sys.path so backend module is discoverable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from firebase_functions import https_fn
from firebase_admin import initialize_app
from a2wsgi import ASGIMiddleware
from backend.main import app as fastapi_app

try:
    initialize_app()
except Exception:
    pass

wsgi_app = ASGIMiddleware(fastapi_app)

@https_fn.on_request(cors=True)
def api(req: https_fn.Request) -> https_fn.Response:
    """Firebase Cloud Function entrypoint wrapping HealthSync FastAPI application."""
    return https_fn.Response.from_app(wsgi_app, req.environ)
