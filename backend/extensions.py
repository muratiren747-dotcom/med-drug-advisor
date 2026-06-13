# backend/extensions.py
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# We initialize the limiter here. No 'app' needed yet.
limiter = Limiter(key_func=get_remote_address)