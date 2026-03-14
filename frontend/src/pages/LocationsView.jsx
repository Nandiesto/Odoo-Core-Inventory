import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { BsGeoAlt, BsPlus, BsSearch } from 'react-icons/bs';

export const LocationsView = () => {
    const [locations, setLocations] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', warehouse: '', location_type: 'internal' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [locRes, whRes] = await Promise.all([
                api.getLocations(),
                api.getWarehouses()
            ]);
            setLocations(locRes.data);
            setWarehouses(whRes.data);
            if (whRes.data.length > 0) {
                setFormData(prev => ({ ...prev, warehouse: whRes.data[0].id }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.createLocation(formData);
            setShowModal(false);
            setFormData({ name: '', warehouse: warehouses[0]?.id || '', location_type: 'internal' });
            loadData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create location');
        } finally {
            setSaving(false);
        }
    };

    const typeColors = {
        'internal': { bg: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa' },
        'supplier': { bg: 'rgba(212, 175, 55, 0.1)', color: 'var(--color-accent-gold-primary)' },
        'customer': { bg: 'rgba(74, 222, 128, 0.1)', color: '#4ade80' },
        'inventory': { bg: 'rgba(192, 132, 252, 0.1)', color: '#c084fc' },
        'production': { bg: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="title-primary" style={{ fontSize: '2rem' }}>
                        <BsGeoAlt style={{ marginRight: '12px', color: 'var(--color-accent-gold-primary)' }} />
                        Locations
                    </h1>
                    <p className="text-muted">Manage specific stock locations within warehouses (e.g. Aisle 1, Shelf B).</p>
                </div>
                <button className="glass-button primary" onClick={() => setShowModal(true)}>
                    <BsPlus style={{ fontSize: '1.2rem' }} /> New Location
                </button>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: 'var(--glass-border)' }}>
                        <tr>
                            {['Location Name', 'Warehouse', 'Type'].map(h => (
                                <th key={h} style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="3" style={{ padding: '40px', textAlign: 'center' }}>Loading...</td></tr>
                        ) : locations.length === 0 ? (
                            <tr><td colSpan="3" style={{ padding: '40px', textAlign: 'center' }} className="text-muted">No locations found.</td></tr>
                        ) : locations.map(l => (
                            <tr key={l.id} className="glass-interactive" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '16px 24px', fontWeight: 600 }}>{l.name}</td>
                                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{l.warehouse_name || '—'}</td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        ...typeColors[l.location_type], padding: '4px 10px', borderRadius: '12px',
                                        fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', border: `1px solid ${typeColors[l.location_type]?.color}40`
                                    }}>
                                        {l.location_type}
                                    </span>
                                </td>
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
                        <h2 className="title-secondary" style={{ marginBottom: '24px' }}>Create New Location</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="form-label">Location Name *</label>
                                <input required className="glass-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Stock Shelf A" />
                            </div>
                            <div>
                                <label className="form-label">Warehouse *</label>
                                <select required className="glass-input" value={formData.warehouse} onChange={e => setFormData({ ...formData, warehouse: e.target.value })} style={{ appearance: 'none', background: '#111' }}>
                                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                <button type="button" className="glass-button" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="glass-button primary" disabled={saving}>{saving ? 'Saving...' : 'Create Location'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
