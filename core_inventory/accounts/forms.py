from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import AuthenticationForm

User = get_user_model()


class SignUpForm(forms.ModelForm):
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput(attrs={
        'class': 'form-input', 'placeholder': 'Create a password',
    }))
    password2 = forms.CharField(label='Confirm Password', widget=forms.PasswordInput(attrs={
        'class': 'form-input', 'placeholder': 'Confirm your password',
    }))

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'role', 'phone')
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Username'}),
            'email': forms.EmailInput(attrs={'class': 'form-input', 'placeholder': 'you@example.com'}),
            'first_name': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'First name'}),
            'last_name': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Last name'}),
            'role': forms.Select(attrs={'class': 'form-input'}),
            'phone': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Phone number'}),
        }

    def clean_password2(self):
        p1 = self.cleaned_data.get('password1')
        p2 = self.cleaned_data.get('password2')
        if p1 and p2 and p1 != p2:
            raise forms.ValidationError('Passwords do not match.')
        return p2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password1'])
        if commit:
            user.save()
        return user


class LoginForm(AuthenticationForm):
    username = forms.CharField(widget=forms.TextInput(attrs={
        'class': 'form-input', 'placeholder': 'Username',
    }))
    password = forms.CharField(widget=forms.PasswordInput(attrs={
        'class': 'form-input', 'placeholder': 'Password',
    }))


class OTPRequestForm(forms.Form):
    email = forms.EmailField(widget=forms.EmailInput(attrs={
        'class': 'form-input', 'placeholder': 'Your registered email',
    }))


class OTPVerifyForm(forms.Form):
    otp = forms.CharField(max_length=6, widget=forms.TextInput(attrs={
        'class': 'form-input', 'placeholder': 'Enter 6-digit OTP',
    }))


class ResetPasswordForm(forms.Form):
    new_password1 = forms.CharField(label='New Password', widget=forms.PasswordInput(attrs={
        'class': 'form-input', 'placeholder': 'New password',
    }))
    new_password2 = forms.CharField(label='Confirm Password', widget=forms.PasswordInput(attrs={
        'class': 'form-input', 'placeholder': 'Confirm new password',
    }))

    def clean(self):
        cleaned = super().clean()
        p1 = cleaned.get('new_password1')
        p2 = cleaned.get('new_password2')
        if p1 and p2 and p1 != p2:
            raise forms.ValidationError('Passwords do not match.')
        return cleaned


class ProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'phone')
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-input'}),
            'last_name': forms.TextInput(attrs={'class': 'form-input'}),
            'email': forms.EmailInput(attrs={'class': 'form-input'}),
            'phone': forms.TextInput(attrs={'class': 'form-input'}),
        }
