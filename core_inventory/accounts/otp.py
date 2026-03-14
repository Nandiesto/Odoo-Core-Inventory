import random
import string
from django.utils import timezone
from datetime import timedelta


OTP_EXPIRY_MINUTES = 5


def generate_otp(length=6):
    """Generate a numeric OTP."""
    return ''.join(random.choices(string.digits, k=length))


def store_otp(request, email, otp):
    """Store OTP data in the session."""
    request.session['otp_data'] = {
        'email': email,
        'otp': otp,
        'created_at': timezone.now().isoformat(),
    }


def verify_otp(request, email, otp):
    """Verify the OTP from session. Returns True if valid."""
    data = request.session.get('otp_data')
    if not data:
        return False
    if data['email'] != email:
        return False
    if data['otp'] != otp:
        return False
    created = timezone.datetime.fromisoformat(data['created_at'])
    if timezone.now() - created > timedelta(minutes=OTP_EXPIRY_MINUTES):
        return False
    return True


def clear_otp(request):
    """Remove OTP data from session."""
    request.session.pop('otp_data', None)
