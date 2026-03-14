from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.mail import send_mail
from django.conf import settings as app_settings

from .forms import (
    SignUpForm, LoginForm, OTPRequestForm, OTPVerifyForm,
    ResetPasswordForm, ProfileForm,
)
from .otp import generate_otp, store_otp, verify_otp, clear_otp

User = get_user_model()


def signup_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard:home')
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Account created successfully!')
            return redirect('dashboard:home')
    else:
        form = SignUpForm()
    return render(request, 'accounts/signup.html', {'form': form})


def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard:home')
    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            login(request, form.get_user())
            messages.success(request, 'Welcome back!')
            return redirect(request.GET.get('next', 'dashboard:home'))
    else:
        form = LoginForm()
    return render(request, 'accounts/login.html', {'form': form})


def logout_view(request):
    logout(request)
    messages.info(request, 'You have been logged out.')
    return redirect('accounts:login')


# ────── OTP Password Reset Flow ──────

def otp_request_view(request):
    """Step 1: User enters email, OTP is generated and printed to console."""
    if request.method == 'POST':
        form = OTPRequestForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            try:
                User.objects.get(email=email)
            except User.DoesNotExist:
                messages.error(request, 'No account found with that email.')
                return render(request, 'accounts/otp_request.html', {'form': form})

            otp = generate_otp()
            store_otp(request, email, otp)
            # Send OTP via email
            try:
                send_mail(
                    subject='Your Password Reset OTP — Core Inventory',
                    message=f'Your OTP code is: {otp}\n\nThis code expires in 5 minutes.',
                    from_email=app_settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
                messages.success(request, 'OTP has been sent to your email!')
            except Exception as e:
                messages.error(request, f'Failed to send email. Please try again.')
                return render(request, 'accounts/otp_request.html', {'form': form})
            return redirect('accounts:otp_verify')
    else:
        form = OTPRequestForm()
    return render(request, 'accounts/otp_request.html', {'form': form})


def otp_verify_view(request):
    """Step 2: User enters OTP."""
    otp_data = request.session.get('otp_data')
    if not otp_data:
        messages.error(request, 'Please request an OTP first.')
        return redirect('accounts:otp_request')

    if request.method == 'POST':
        form = OTPVerifyForm(request.POST)
        if form.is_valid():
            otp = form.cleaned_data['otp']
            if verify_otp(request, otp_data['email'], otp):
                request.session['otp_verified_email'] = otp_data['email']
                clear_otp(request)
                return redirect('accounts:reset_password')
            else:
                messages.error(request, 'Invalid or expired OTP.')
    else:
        form = OTPVerifyForm()
    return render(request, 'accounts/otp_verify.html', {'form': form})


def reset_password_view(request):
    """Step 3: Set new password after OTP verification."""
    email = request.session.get('otp_verified_email')
    if not email:
        messages.error(request, 'OTP verification required.')
        return redirect('accounts:otp_request')

    if request.method == 'POST':
        form = ResetPasswordForm(request.POST)
        if form.is_valid():
            user = User.objects.get(email=email)
            user.set_password(form.cleaned_data['new_password1'])
            user.save()
            request.session.pop('otp_verified_email', None)
            messages.success(request, 'Password reset successful! Please log in.')
            return redirect('accounts:login')
    else:
        form = ResetPasswordForm()
    return render(request, 'accounts/reset_password.html', {'form': form})


@login_required
def profile_view(request):
    if request.method == 'POST':
        form = ProfileForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated.')
            return redirect('accounts:profile')
    else:
        form = ProfileForm(instance=request.user)
    return render(request, 'accounts/profile.html', {'form': form})
