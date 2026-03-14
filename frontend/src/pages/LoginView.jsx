import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export const LoginView = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) return;

        setLoading(true);
        setError(null);
        try {
            const response = await api.login({ username, password });
            // Store JWT tokens securely in local storage
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('username', username);

            // Redirect to dashboard on success
            navigate('/dashboard');
        } catch (err) {
            console.error("Login failed:", err);
            setError('Invalid username or password.');
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
            padding: '20px'
        }}>
            {/* Centered Glass Panel */}
            <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, var(--color-accent-gold-primary), var(--color-accent-gold-hover))',
                        margin: '0 auto 20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px var(--color-accent-gold-glow)'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                    </div>
                    <h1 className="title-primary">Welcome Back</h1>
                    <p className="text-muted">Sign in to your Core Inventory dashboard.</p>
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

                <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={handleLogin}>
                    <div>
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label className="form-label">Password</label>
                        </div>
                        <input
                            type="password"
                            className="glass-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="glass-button primary"
                        style={{ width: '100%', marginTop: '12px', padding: '16px', opacity: loading ? 0.7 : 1 }}
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                    </button>
                </form>

            </div>
        </div>
    );
};
