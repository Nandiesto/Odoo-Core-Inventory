import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { BsPlus, BsSearch, BsFilter, BsThreeDotsVertical } from 'react-icons/bs';

export const ProductsView = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ name: '', sku: '', category: '', uom: 'unit', description: '' });

    // Category Modal state
    const [showCatModal, setShowCatModal] = useState(false);
    const [savingCat, setSavingCat] = useState(false);
    const [catData, setCatData] = useState({ name: '', description: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.getProducts(),
                api.getCategories().catch(() => ({ data: [] }))
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
            if (catRes.data.length > 0) {
                setFormData(prev => ({ ...prev, category: catRes.data[0].id }));
            }
        } catch (err) {
            console.error(err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.createProduct(formData);
            setShowModal(false);
            setFormData({ name: '', sku: '', category: categories[0]?.id || '', uom: 'unit', description: '' });
            loadData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create product');
        } finally {
            setSaving(false);
        }
    };

    const handleCatSubmit = async (e) => {
        e.preventDefault();
        setSavingCat(true);
        try {
            const res = await api.createCategory(catData);
            setShowCatModal(false);
            setCatData({ name: '', description: '' });
            // Refresh data to get new category
            loadData();
            // Optional: Auto-select new category in product form
            setFormData(prev => ({ ...prev, category: res.data.id }));
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create category');
        } finally {
            setSavingCat(false);
        }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="title-primary" style={{ fontSize: '2rem' }}>Product Catalog</h1>
                    <p className="text-muted">Manage your global inventory items and stock levels.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="glass-button" onClick={() => setShowCatModal(true)}>
                        <BsPlus style={{ fontSize: '1.2rem' }} /> Add Category
                    </button>
                    <button className="glass-button primary" onClick={() => setShowModal(true)}>
                        <BsPlus style={{ fontSize: '1.2rem' }} /> Add Product
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <BsSearch style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-tertiary)' }} />
                    <input
                        type="text"
                        className="glass-input"
                        placeholder="Search products by name or SKU..."
                        style={{ paddingLeft: '48px' }}
                    />
                </div>
                <button className="glass-button" style={{ width: '120px' }}>
                    <BsFilter /> Filters
                </button>
            </div>

            {/* Glass Data Table */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: 'var(--glass-border)' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>SKU</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Product Name</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Category</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Stock on Hand</th>
                            <th style={{ padding: '16px 24px', textAlign: 'center' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center' }}>Loading...</td></tr>
                        ) : products.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center' }} className="text-muted">No products found.</td></tr>
                        ) : products.map(p => (
                            <tr key={p.id} className="glass-interactive" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '16px 24px' }}><span className="gold-text" style={{ fontWeight: 600 }}>{p.sku}</span></td>
                                <td style={{ padding: '16px 24px', fontWeight: 500 }}>{p.name}</td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>{p.category_name}</span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                        <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{p.total_stock}</span>
                                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>{p.uom_display}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                    <button className="glass-button" style={{ padding: '8px', borderRadius: '8px' }}><BsThreeDotsVertical /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Product Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
                        <h2 className="title-secondary" style={{ marginBottom: '24px' }}>Create New Product</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="form-label">Product Name *</label>
                                    <input required className="glass-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Widget A" />
                                </div>
                                <div>
                                    <label className="form-label">SKU *</label>
                                    <input required className="glass-input" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="e.g. WDG-001" />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="form-label">Category *</label>
                                    <select required className="glass-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ appearance: 'none', background: '#111' }}>
                                        <option value="">-- Select --</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Unit of Measure *</label>
                                    <select required className="glass-input" value={formData.uom} onChange={e => setFormData({ ...formData, uom: e.target.value })} style={{ appearance: 'none', background: '#111' }}>
                                        <option value="unit">Units (pcs)</option>
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="liters">Liters (L)</option>
                                        <option value="meters">Meters (m)</option>
                                        <option value="hours">Hours (hr)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Description</label>
                                <textarea className="glass-input" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Product details..." rows="2" />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                <button type="button" className="glass-button" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="glass-button primary" disabled={saving}>{saving ? 'Saving...' : 'Create Product'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Category Modal */}
            {showCatModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
                        <h2 className="title-secondary" style={{ marginBottom: '24px' }}>Create Category</h2>
                        <form onSubmit={handleCatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="form-label">Category Name *</label>
                                <input required className="glass-input" value={catData.name} onChange={e => setCatData({ ...catData, name: e.target.value })} placeholder="e.g. Electronics" />
                            </div>
                            <div>
                                <label className="form-label">Description</label>
                                <textarea className="glass-input" value={catData.description} onChange={e => setCatData({ ...catData, description: e.target.value })} placeholder="Optional details..." rows="3" />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                <button type="button" className="glass-button" onClick={() => setShowCatModal(false)}>Cancel</button>
                                <button type="submit" className="glass-button primary" disabled={savingCat}>{savingCat ? 'Saving...' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
