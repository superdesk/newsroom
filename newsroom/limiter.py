
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(None, key_func=get_remote_address)
