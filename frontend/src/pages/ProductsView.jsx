import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { BsPlus, BsSearch, BsFilter, BsThreeDotsVertical } from 'react-icons/bs';

export const ProductsView = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            // Mocking fetch for now if API unlinked, but we wrote the real django DRF api client
            const res = await api.getProducts();
            setProducts(res.data);
        } catch (err) {
            console.error(err);
            // Fallback dummy data for visualization
            setProducts([
                { id: 1, sku: 'PROD-001', name: 'MacBook Pro 16"', category_name: 'Electronics', total_stock: 45, uom_display: 'Unit' },
                { id: 2, sku: 'PROD-002', name: 'Logitech MX Master 3', category_name: 'Accessories', total_stock: 120, uom_display: 'Unit' },
                { id: 3, sku: 'PROD-003', name: 'Dell UltraSharp 27"', category_name: 'Electronics', total_stock: 32, uom_display: 'Unit' },
                { id: 4, sku: 'PROD-004', name: 'Herman Miller Aeron', category_name: 'Furniture', total_stock: 8, uom_display: 'Unit' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="title-primary" style={{ fontSize: '2rem' }}>Product Catalog</h1>
                    <p className="text-muted">Manage your global inventory items and stock levels.</p>
                </div>
                <button className="glass-button primary">
                    <BsPlus style={{ fontSize: '1.2rem' }} /> Add Product
                </button>
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

        </div>
    );
};
