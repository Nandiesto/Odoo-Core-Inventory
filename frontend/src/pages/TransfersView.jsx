import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { BsArrowLeftRight, BsCheckLg, BsX, BsPlus, BsSearch } from 'react-icons/bs';

const StatusBadge = ({ status }) => {
    const colors = {
        'draft': { bg: 'rgba(255,255,255,0.05)', color: '#fff', border: 'rgba(255,255,255,0.2)' },
        'waiting': { bg: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', border: 'rgba(96, 165, 250, 0.3)' },
        'ready': { bg: 'rgba(212, 175, 55, 0.1)', color: 'var(--color-accent-gold-primary)', border: 'rgba(212, 175, 55, 0.3)' },
        'done': { bg: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: 'rgba(74, 222, 128, 0.3)' },
        'cancelled': { bg: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: 'rgba(248, 113, 113, 0.3)' }
    };
    const style = colors[status] || colors['draft'];
    return (
        <span style={{
            background: style.bg, color: style.color, border: `1px solid ${style.border}`,
            padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem',
            fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px'
        }}>
            {status}
        </span>
    );
};

export const TransfersView = () => {
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [locations, setLocations] = useState([]);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({ product: '', quantity: 1, from_location: '', to_location: '', scheduled_date: '', reference: '' });

    useEffect(() => {
        loadData();
    }, [statusFilter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const params = statusFilter ? { status: statusFilter } : {};
            const [trnRes, locRes, prodRes] = await Promise.all([
                api.getTransfers(params),
                api.getLocations().catch(() => ({ data: [] })),
                api.getProducts().catch(() => ({ data: [] }))
            ]);
            setTransfers(trnRes.data);
            setLocations(locRes.data);
            setProducts(prodRes.data);

            if (locRes.data.length > 0) {
                if (!formData.from_location) {
                    setFormData(prev => ({ ...prev, from_location: locRes.data[0].id }));
                }
                if (!formData.to_location && locRes.data.length > 1) {
                    setFormData(prev => ({ ...prev, to_location: locRes.data[1].id }));
                } else if (!formData.to_location && locRes.data.length === 1) {
                    setFormData(prev => ({ ...prev, to_location: locRes.data[0].id }));
                }
            }
            if (!formData.product && prodRes.data.length > 0) {
                setFormData(prev => ({ ...prev, product: prodRes.data[0].id }));
            }
        } catch (err) {
            console.error(err);
            setTransfers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id) => {
        setActionLoading(id);
        try {
            await api.confirmTransfer(id);
            loadData();
        } catch (err) {
            alert(err.response?.data?.error || 'Confirmation failed');
        } finally {
            setActionLoading(null);
        }
    };

    const handleValidate = async (id) => {
        setActionLoading(id);
        try {
            await api.validateTransfer(id);
            loadData();
        } catch (err) {
            alert(err.response?.data?.error || 'Validation failed');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = async (id) => {
        setActionLoading(id);
        try {
            const { apiClient } = await import('../api/client');
            await apiClient.post(`transfers/${id}/cancel/`);
            loadData();
        } catch (err) {
            alert(err.response?.data?.error || 'Cancel failed');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                from_location: formData.from_location,
                to_location: formData.to_location,
                product: formData.product,
                quantity: formData.quantity,
                scheduled_date: formData.scheduled_date || null,
                reference: formData.reference
            };
            await api.createTransfer(payload);
            setShowModal(false);
            setFormData({ product: products[0]?.id || '', quantity: 1, from_location: '', to_location: '', scheduled_date: '', reference: '' });
            loadData();
        } catch (err) {
            console.error(err);
            const errorData = err.response?.data;
            if (errorData && typeof errorData === 'object') {
                const message = Object.keys(errorData)
                    .map(key => `${key}: ${Array.isArray(errorData[key]) ? errorData[key].join(', ') : errorData[key]}`)
                    .join('\n');
                alert(message || 'Failed to create transfer');
            } else {
                alert('Failed to create transfer');
            }
        } finally {
            setSaving(false);
        }
    };

    const statusOptions = ['', 'draft', 'waiting', 'ready', 'done', 'cancelled'];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="title-primary" style={{ fontSize: '2rem' }}>Internal Transfers</h1>
                    <p className="text-muted">Move stock between your internal warehouses and specific locations.</p>
                </div>
                <button className="glass-button primary" onClick={() => setShowModal(true)}>
                    <BsPlus style={{ fontSize: '1.2rem' }} /> New Transfer
                </button>
            </div>

            {/* Filter Bar */}
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <BsSearch style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-tertiary)' }} />
                    <input type="text" className="glass-input" placeholder="Search transfers..." style={{ paddingLeft: '48px' }} />
                </div>
                <select
                    className="glass-input"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: '180px', appearance: 'none' }}
                >
                    {statusOptions.map(s => (
                        <option key={s} value={s} style={{ background: '#111' }}>
                            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}
                        </option>
                    ))}
                </select>
            </div>

            {/* Data Table */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: 'var(--glass-border)' }}>
                        <tr>
                            {['Reference', 'Product', 'From', 'To', 'Qty', 'Status', 'Actions'].map(h => (
                                <th key={h} style={{
                                    padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600,
                                    fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px',
                                    ...(h === 'Actions' ? { textAlign: 'right' } : {})
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center' }}>Loading...</td></tr>
                        ) : transfers.length === 0 ? (
                            <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center' }} className="text-muted">No internal transfers found.</td></tr>
                        ) : transfers.map(t => (
                            <tr key={t.id} className="glass-interactive" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '16px 24px' }}><span className="gold-text" style={{ fontWeight: 600 }}>{t.reference}</span></td>
                                <td style={{ padding: '16px 24px', fontWeight: 500 }}>{t.product_name || 'Multiple/None'}</td>
                                <td style={{ padding: '16px 24px', fontSize: '0.9rem' }}>{t.from_location_display}</td>
                                <td style={{ padding: '16px 24px', fontSize: '0.9rem' }}>{t.to_location_display}</td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t.quantity || '-'}</span>
                                </td>
                                <td style={{ padding: '16px 24px' }}><StatusBadge status={t.status} /></td>
                                <td style={{ padding: '16px 24px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    {t.status === 'draft' && (
                                        <button
                                            className="glass-button primary"
                                            style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'var(--color-accent-gold-primary)', color: '#000' }}
                                            onClick={() => handleConfirm(t.id)}
                                            disabled={actionLoading === t.id}
                                        >
                                            <BsCheckLg /> {actionLoading === t.id ? '...' : 'Confirm'}
                                        </button>
                                    )}
                                    {t.status === 'ready' && (
                                        <button
                                            className="glass-button primary"
                                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                            onClick={() => handleValidate(t.id)}
                                            disabled={actionLoading === t.id}
                                        >
                                            <BsCheckLg /> {actionLoading === t.id ? '...' : 'Validate'}
                                        </button>
                                    )}
                                    {(t.status === 'draft' || t.status === 'waiting' || t.status === 'ready') && t.status !== 'done' && (
                                        <button
                                            className="glass-button"
                                            style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#f87171' }}
                                            onClick={() => handleCancel(t.id)}
                                            disabled={actionLoading === t.id}
                                        >
                                            <BsX /> Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
                        <h2 className="title-secondary" style={{ marginBottom: '24px' }}>Create Internal Transfer</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="form-label">Transfer Description</label>
                                <input className="glass-input" value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} placeholder="e.g. Replenish Store A" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="form-label">Product *</label>
                                    <select required className="glass-input" value={formData.product} onChange={e => setFormData({ ...formData, product: e.target.value })} style={{ appearance: 'none', background: '#111' }}>
                                        <option value="">-- Select Product --</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Quantity *</label>
                                    <input type="number" required min="0.01" step="0.01" className="glass-input" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Source Location *</label>
                                <select required className="glass-input" value={formData.from_location} onChange={e => setFormData({ ...formData, from_location: e.target.value })} style={{ appearance: 'none', background: '#111' }}>
                                    <option value="">-- Select Source --</option>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.warehouse_name})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Destination Location *</label>
                                <select required className="glass-input" value={formData.to_location} onChange={e => setFormData({ ...formData, to_location: e.target.value })} style={{ appearance: 'none', background: '#111' }}>
                                    <option value="">-- Select Destination --</option>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.warehouse_name})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Scheduled Date</label>
                                <input type="date" className="glass-input" value={formData.scheduled_date} onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })} style={{ colorScheme: 'dark' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                <button type="button" className="glass-button" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="glass-button primary" disabled={saving}>{saving ? 'Saving...' : 'Create Transfer'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
