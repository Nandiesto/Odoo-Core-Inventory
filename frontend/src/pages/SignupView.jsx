import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';

export const SignupView = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '', email: '', first_name: '', last_name: '',
        role: 'staff', phone: '', password: '', confirmPassword: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match.");
        }

        setLoading(true);
        setError(null);
        try {
            const response = await api.register(formData);
            // Auto-login on successful registration
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('username', response.data.user.username);

            navigate('/dashboard');
        } catch (err) {
            console.error("Signup failed:", err);
            if (err.response?.data) {
                const firstError = Object.values(err.response.data)[0];
                setError(Array.isArray(firstError) ? firstError[0] : 'Registration failed. Check inputs.');
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '40px' }}>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 className="title-primary">Create Account</h1>
                    <p className="text-muted">Join the Core Inventory platform.</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.3)',
                        color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '20px',
                        fontSize: '0.9rem', textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={handleSignup}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label className="form-label">First Name</label>
                            <input type="text" className="glass-input" name="first_name" placeholder="John" value={formData.first_name} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="form-label">Last Name</label>
                            <input type="text" className="glass-input" name="last_name" placeholder="Doe" value={formData.last_name} onChange={handleChange} required />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Username</label>
                        <input type="text" className="glass-input" name="username" placeholder="johndoe" value={formData.username} onChange={handleChange} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label className="form-label">Email</label>
                            <input type="email" className="glass-input" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="form-label">Phone</label>
                            <input type="tel" className="glass-input" name="phone" placeholder="+1..." value={formData.phone} onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Role</label>
                        <select className="glass-input" name="role" value={formData.role} onChange={handleChange} style={{ appearance: 'none' }}>
                            <option value="staff" style={{ background: '#111' }}>Warehouse Staff</option>
                            <option value="manager" style={{ background: '#111' }}>Inventory Manager</option>
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label className="form-label">Password</label>
                            <input type="password" className="glass-input" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="form-label">Confirm Password</label>
                            <input type="password" className="glass-input" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="glass-button primary"
                        style={{ width: '100%', marginTop: '12px', padding: '16px', opacity: loading ? 0.7 : 1 }}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-muted" style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" className="gold-text" style={{ textDecoration: 'none', fontWeight: 600 }}>Log in</Link>
                </p>

            </div>
        </div>
    );
};
