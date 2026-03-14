import React, { useEffect, useState } from 'react';
import { BsGear, BsPerson, BsShield, BsEnvelope, BsTelephone, BsPencil, BsCheck2 } from 'react-icons/bs';

export const SettingsView = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { apiClient } = await import('../api/client');
            const res = await apiClient.get('auth/me/');
            setUser(res.data);
            setFormData(res.data);
        } catch (err) {
            // Fallback: construct from localStorage
            const username = localStorage.getItem('username') || 'User';
            const fallback = {
                username,
                email: '',
                first_name: '',
                last_name: '',
                role: 'staff',
                role_display: 'Warehouse Staff',
                phone: '',
            };
            setUser(fallback);
            setFormData(fallback);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const { apiClient } = await import('../api/client');
            const res = await apiClient.put('auth/profile/', formData);
            setUser(res.data);
            setEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully.' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}><h1 className="title-primary">Loading Settings...</h1></div>;

    const InfoRow = ({ icon, label, value, name, editable = true }) => (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'rgba(212, 175, 55, 0.1)', color: 'var(--color-accent-gold-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
                }}>
                    {icon}
                </div>
                <div>
                    <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>{label}</p>
                    {editing && editable ? (
                        <input
                            type="text"
                            name={name}
                            className="glass-input"
                            value={formData[name] || ''}
                            onChange={handleChange}
                            style={{ padding: '8px 12px', fontSize: '0.95rem', width: '300px' }}
                        />
                    ) : (
                        <p style={{ fontWeight: 500, fontSize: '1rem' }}>{value || '—'}</p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="title-primary" style={{ fontSize: '2rem' }}>
                        <BsGear style={{ marginRight: '12px', color: 'var(--color-accent-gold-primary)' }} />
                        Settings
                    </h1>
                    <p className="text-muted">Manage your profile and account preferences.</p>
                </div>
            </div>

            {message && (
                <div style={{
                    background: message.type === 'success' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                    border: `1px solid ${message.type === 'success' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
                    color: message.type === 'success' ? '#4ade80' : '#f87171',
                    padding: '12px 20px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem'
                }}>
                    {message.text}
                </div>
            )}

            {/* Profile Card */}
            <div className="glass-panel" style={{ padding: '40px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '20px',
                            background: 'linear-gradient(135deg, var(--color-accent-gold-primary), var(--color-accent-gold-hover))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.8rem', fontWeight: 800, color: '#000',
                            boxShadow: '0 8px 24px var(--color-accent-gold-glow)'
                        }}>
                            {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                        </div>
                        <div>
                            <h2 className="title-secondary">
                                {user?.first_name && user?.last_name
                                    ? `${user.first_name} ${user.last_name}`
                                    : user?.username}
                            </h2>
                            <span style={{
                                background: 'rgba(212, 175, 55, 0.1)', color: 'var(--color-accent-gold-primary)',
                                border: '1px solid rgba(212, 175, 55, 0.3)', padding: '4px 12px',
                                borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase'
                            }}>
                                {user?.role_display || user?.role}
                            </span>
                        </div>
                    </div>
                    <button
                        className={`glass-button ${editing ? 'primary' : ''}`}
                        onClick={() => {
                            if (editing) {
                                handleSave();
                            } else {
                                setEditing(true);
                                setMessage(null);
                            }
                        }}
                        disabled={saving}
                    >
                        {editing ? <><BsCheck2 /> {saving ? 'Saving...' : 'Save'}</> : <><BsPencil /> Edit Profile</>}
                    </button>
                </div>

                <InfoRow icon={<BsPerson />} label="Username" value={user?.username} name="username" editable={false} />
                <InfoRow icon={<BsPerson />} label="First Name" value={user?.first_name} name="first_name" />
                <InfoRow icon={<BsPerson />} label="Last Name" value={user?.last_name} name="last_name" />
                <InfoRow icon={<BsEnvelope />} label="Email" value={user?.email} name="email" />
                <InfoRow icon={<BsTelephone />} label="Phone" value={user?.phone} name="phone" />
                <InfoRow icon={<BsShield />} label="Role" value={user?.role_display || user?.role} name="role" editable={false} />

                {editing && (
                    <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            className="glass-button"
                            onClick={() => { setEditing(false); setFormData(user); setMessage(null); }}
                            style={{ color: '#f87171' }}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {/* App Info */}
            <div className="glass-card" style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05), rgba(0,0,0,0.2))' }}>
                <h3 className="title-secondary" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>About Core Inventory</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
                    <div className="text-muted">Version</div><div>1.0.0</div>
                    <div className="text-muted">Backend</div><div>Django 6.0 + DRF</div>
                    <div className="text-muted">Frontend</div><div>React 19 + Vite 8</div>
                    <div className="text-muted">Database</div><div>PostgreSQL</div>
                </div>
            </div>
        </div>
    );
};
