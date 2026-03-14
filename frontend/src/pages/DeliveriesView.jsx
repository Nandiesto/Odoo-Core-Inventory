import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { BsTruck, BsCheckLg, BsX, BsPlus, BsSearch } from 'react-icons/bs';

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

export const DeliveriesView = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [locations, setLocations] = useState([]);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({ location: '', customer: '', scheduled_date: '', reference: '', lines: [{ product: '', quantity: 1 }] });

    useEffect(() => {
        loadData();
    }, [statusFilter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const params = statusFilter ? { status: statusFilter } : {};
            const [delRes, locRes, prodRes] = await Promise.all([
                api.getDeliveries(params),
                api.getLocations().catch(() => ({ data: [] })),
                api.getProducts().catch(() => ({ data: [] }))
            ]);
            setDeliveries(delRes.data);
            setLocations(locRes.data);
            setProducts(prodRes.data);

            if (!formData.location && locRes.data.length > 0) {
                setFormData(prev => ({ ...prev, location: locRes.data[0].id }));
            }
            if (!formData.lines[0].product && prodRes.data.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    lines: [{ product: prodRes.data[0].id, quantity: 1 }]
                }));
            }
        } catch (err) {
            console.error(err);
            setDeliveries([]);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id) => {
        setActionLoading(id);
        try {
            await api.confirmDelivery(id);
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
            await api.validateDelivery(id);
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
            await apiClient.post(`deliveries/${id}/cancel/`);
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
            await api.createDelivery(formData);
            setShowModal(false);
            setFormData({
                location: '', customer: '', scheduled_date: '', reference: '',
                lines: [{ product: products[0]?.id || '', quantity: 1 }]
            });
            loadData();
        } catch (err) {
            console.error(err);
            const errorData = err.response?.data;
            if (errorData && typeof errorData === 'object') {
                const message = Object.keys(errorData)
                    .map(key => `${key}: ${Array.isArray(errorData[key]) ? errorData[key].join(', ') : errorData[key]}`)
                    .join('\n');
                alert(message || 'Failed to create delivery');
            } else {
                alert('Failed to create delivery');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleAddLine = () => {
        setFormData(prev => ({
            ...prev,
            lines: [...prev.lines, { product: products[0]?.id || '', quantity: 1 }]
        }));
    };

    const handleLineChange = (index, field, value) => {
        const newLines = [...formData.lines];
        newLines[index][field] = value;
        setFormData(prev => ({ ...prev, lines: newLines }));
    };

    const handleRemoveLine = (index) => {
        const newLines = formData.lines.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, lines: newLines }));
    };

    const statusOptions = ['', 'draft', 'waiting', 'ready', 'done', 'cancelled'];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="title-primary" style={{ fontSize: '2rem' }}>Delivery Orders</h1>
                    <p className="text-muted">Manage outgoing shipments to customers from your warehouse locations.</p>
                </div>
                <button className="glass-button primary" onClick={() => setShowModal(true)}>
                    <BsPlus style={{ fontSize: '1.2rem' }} /> New Delivery
                </button>
            </div>

            {/* Filter Bar */}
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <BsSearch style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-tertiary)' }} />
                    <input type="text" className="glass-input" placeholder="Search deliveries..." style={{ paddingLeft: '48px' }} />
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
                            {['Reference', 'Customer', 'Scheduled Date', 'Source Location', 'Status', 'Actions'].map(h => (
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
                            <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>Loading...</td></tr>
                        ) : deliveries.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center' }} className="text-muted">No delivery orders found.</td></tr>
                        ) : deliveries.map(d => (
                            <tr key={d.id} className="glass-interactive" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '16px 24px' }}><span className="gold-text" style={{ fontWeight: 600 }}>{d.reference}</span></td>
                                <td style={{ padding: '16px 24px', fontWeight: 500 }}>{d.customer}</td>
                                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{d.scheduled_date}</td>
                                <td style={{ padding: '16px 24px' }}>{d.location_display}</td>
                                <td style={{ padding: '16px 24px' }}><StatusBadge status={d.status} /></td>
                                <td style={{ padding: '16px 24px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    {d.status === 'draft' && (
                                        <button
                                            className="glass-button primary"
                                            style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'var(--color-accent-gold-primary)', color: '#000' }}
                                            onClick={() => handleConfirm(d.id)}
                                            disabled={actionLoading === d.id}
                                        >
                                            <BsCheckLg /> {actionLoading === d.id ? '...' : 'Confirm'}
                                        </button>
                                    )}
                                    {d.status === 'ready' && (
                                        <button
                                            className="glass-button primary"
                                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                            onClick={() => handleValidate(d.id)}
                                            disabled={actionLoading === d.id}
                                        >
                                            <BsCheckLg /> {actionLoading === d.id ? '...' : 'Validate'}
                                        </button>
                                    )}
                                    {(d.status === 'draft' || d.status === 'waiting' || d.status === 'ready') && d.status !== 'done' && (
                                        <button
                                            className="glass-button"
                                            style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#f87171' }}
                                            onClick={() => handleCancel(d.id)}
                                            disabled={actionLoading === d.id}
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
                        <h2 className="title-secondary" style={{ marginBottom: '24px' }}>Create New Delivery</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="form-label">Customer Order Ref</label>
                                <input className="glass-input" value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} placeholder="e.g. SO-2026-001" />
                            </div>
                            <div>
                                <label className="form-label">Source (Your Warehouse) *</label>
                                <select required className="glass-input" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} style={{ appearance: 'none', background: '#111' }}>
                                    <option value="">-- Select Source Location --</option>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.warehouse_name})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Customer Name *</label>
                                <input required className="glass-input" value={formData.customer} onChange={e => setFormData({ ...formData, customer: e.target.value })} placeholder="e.g. John Doe" />
                            </div>

                            <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <label className="form-label" style={{ margin: 0 }}>Products *</label>
                                    <button type="button" onClick={handleAddLine} style={{ background: 'none', border: 'none', color: 'var(--color-accent-gold-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                                        + Add Line
                                    </button>
                                </div>
                                {formData.lines.map((line, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                                        <select required className="glass-input" value={line.product} onChange={e => handleLineChange(idx, 'product', e.target.value)} style={{ flex: 2, appearance: 'none', background: '#111' }}>
                                            <option value="">-- Select Product --</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        <input type="number" required min="0.01" step="0.01" className="glass-input" value={line.quantity} onChange={e => handleLineChange(idx, 'quantity', e.target.value)} style={{ flex: 1 }} placeholder="Qty" />
                                        {formData.lines.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveLine(idx)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}>
                                                <BsX />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="form-label">Scheduled Date</label>
                                <input type="date" className="glass-input" value={formData.scheduled_date} onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })} style={{ colorScheme: 'dark' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                <button type="button" className="glass-button" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="glass-button primary" disabled={saving}>{saving ? 'Saving...' : 'Create Draft'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
