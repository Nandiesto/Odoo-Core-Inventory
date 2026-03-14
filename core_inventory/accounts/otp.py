import random
import string
from django.utils import timezone
from django.core.cache import cache
from datetime import timedelta, timezone as dt_timezone

OTP_EXPIRY_MINUTES = 5

def generate_otp(length=6):
    """Generate a numeric OTP."""
    return ''.join(random.choices(string.digits, k=length))

def store_otp(email, otp):
    """Store OTP data in the global cache (stateless for API)."""
    cache_key = f"otp_{email}"
    cache_data = {
        'otp': otp,
        'created_at': timezone.now().timestamp(),
    }
    # Cache timeout exactly matches expiry (in seconds)
    cache.set(cache_key, cache_data, timeout=OTP_EXPIRY_MINUTES * 60)

def verify_otp(email, otp):
    """Verify the OTP from cache. Returns True if valid."""
    cache_key = f"otp_{email}"
    data = cache.get(cache_key)
    
    if not data:
        return False
    if data['otp'] != otp:
        return False
        
    created = timezone.datetime.fromtimestamp(data['created_at'], tz=dt_timezone.utc)
    if timezone.now() - created > timedelta(minutes=OTP_EXPIRY_MINUTES):
        return False
        
    return True

def clear_otp(email):
    """Remove OTP data from cache."""
    cache_key = f"otp_{email}"
    cache.delete(cache_key)

