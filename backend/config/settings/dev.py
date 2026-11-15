from .base import *

DEBUG = True
CORS_ALLOW_ALL_ORIGINS = True
ALLOWED_HOSTS = ['*']

# In dev, allow console email backend if SMTP host is not reachable
if EMAIL_HOST == 'localhost' and EMAIL_PORT == 1025:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

