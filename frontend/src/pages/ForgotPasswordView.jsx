import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { BsCheckCircle } from 'react-icons/bs';

export const ForgotPasswordView = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [tempToken, setTempToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setLoading(true); setError(null);
        try {
            await api.requestOtp(email);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true); setError(null);
        try {
            const res = await api.verifyOtp(email, otp);
            setTempToken(res.data.temp_token);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return setError("Passwords do not match.");
        setLoading(true); setError(null);
        try {
            await api.resetPassword({ temp_token: tempToken, new_password: password });
            setStep(4);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 className="title-primary">
                        {step === 1 ? 'Reset Password' : step === 2 ? 'Verify OTP' : step === 3 ? 'New Password' : 'Password Reset'}
                    </h1>
                    <p className="text-muted">
                        {step === 1 ? 'Enter your email to receive a secure code.' :
                            step === 2 ? `Enter the 6-digit code sent to ${email}` :
                                step === 3 ? 'Securely set your new account password.' :
                                    'You can now log in normally.'}
                    </p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.3)', color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={handleRequestOTP}>
                        <div>
                            <label className="form-label">Email Address</label>
                            <input type="email" className="glass-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required />
                        </div>
                        <button type="submit" className="glass-button primary" style={{ width: '100%', padding: '16px' }} disabled={loading}>
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={handleVerifyOTP}>
                        <div>
                            <label className="form-label">6-Digit Code</label>
                            <input type="text" className="glass-input" placeholder="123456" maxLength={6} style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }} value={otp} onChange={(e) => setOtp(e.target.value)} disabled={loading} required />
                        </div>
                        <button type="submit" className="glass-button primary" style={{ width: '100%', padding: '16px' }} disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={handleResetPassword}>
                        <div>
                            <label className="form-label">New Password</label>
                            <input type="password" className="glass-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} required />
                        </div>
                        <div>
                            <label className="form-label">Confirm Password</label>
                            <input type="password" className="glass-input" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} required />
                        </div>
                        <button type="submit" className="glass-button primary" style={{ width: '100%', padding: '16px' }} disabled={loading}>
                            {loading ? 'Saving...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                {step === 4 && (
                    <div style={{ textAlign: 'center' }}>
                        <BsCheckCircle style={{ fontSize: '48px', color: '#4ade80', marginBottom: '20px' }} />
                        <h2 className="title-secondary" style={{ marginBottom: '24px' }}>Success!</h2>
                        <button onClick={() => navigate('/login')} className="glass-button primary" style={{ width: '100%', padding: '16px' }}>
                            Back to Login
                        </button>
                    </div>
                )}

                {step < 4 && (
                    <p className="text-muted" style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem' }}>
                        <Link to="/login" className="gold-text" style={{ textDecoration: 'none', fontWeight: 600 }}>Cancel</Link>
                    </p>
                )}

            </div>
        </div>
    );
};
