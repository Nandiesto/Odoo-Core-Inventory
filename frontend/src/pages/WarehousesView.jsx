import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { BsBuilding, BsPlus, BsSearch } from 'react-icons/bs';

export const WarehousesView = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '', address: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadWarehouses();
    }, []);

    const loadWarehouses = async () => {
        try {
            const res = await api.getWarehouses();
            setWarehouses(res.data);
        } catch (err) {
            console.error(err);
            setWarehouses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.createWarehouse(formData);
            setShowModal(false);
            setFormData({ name: '', code: '', address: '' });
            loadWarehouses();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create warehouse');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="title-primary" style={{ fontSize: '2rem' }}>
                        <BsBuilding style={{ marginRight: '12px', color: 'var(--color-accent-gold-primary)' }} />
                        Warehouses
                    </h1>
                    <p className="text-muted">Manage your physical facilities and distribution centers.</p>
                </div>
                <button className="glass-button primary" onClick={() => setShowModal(true)}>
                    <BsPlus style={{ fontSize: '1.2rem' }} /> New Warehouse
                </button>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: 'var(--glass-border)' }}>
                        <tr>
                            {['Code', 'Name', 'Address'].map(h => (
                                <th key={h} style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="3" style={{ padding: '40px', textAlign: 'center' }}>Loading...</td></tr>
                        ) : warehouses.length === 0 ? (
                            <tr><td colSpan="3" style={{ padding: '40px', textAlign: 'center' }} className="text-muted">No warehouses found.</td></tr>
                        ) : warehouses.map(w => (
                            <tr key={w.id} className="glass-interactive" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '16px 24px' }}><span className="gold-text" style={{ fontWeight: 600 }}>{w.code}</span></td>
                                <td style={{ padding: '16px 24px', fontWeight: 500 }}>{w.name}</td>
                                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{w.address || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Workflow */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
                        <h2 className="title-secondary" style={{ marginBottom: '24px' }}>Create New Warehouse</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="form-label">Warehouse Name *</label>
                                <input required className="glass-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Main Distribution Center" />
                            </div>
                            <div>
                                <label className="form-label">Address</label>
                                <textarea className="glass-input" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Full address details..." rows="3" />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                <button type="button" className="glass-button" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="glass-button primary" disabled={saving}>{saving ? 'Saving...' : 'Create Warehouse'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
