"""Shared pytest fixtures for backend unit tests."""

import os
import sys

import pytest

# Ensure backend/ is on sys.path so `import app` and `import ai_models` work
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Avoid writing into a production-like instance DB during tests
os.environ.setdefault('FLASK_ENV', 'testing')
os.environ.setdefault('WEATHER_API_KEY', 'demo_key')


@pytest.fixture
def app_module():
    """Import the Flask app module once per test that needs it."""
    import app as flask_app
    flask_app.app.config['TESTING'] = True
    return flask_app


@pytest.fixture
def client(app_module):
    """Flask test client (no live server)."""
    return app_module.app.test_client()
