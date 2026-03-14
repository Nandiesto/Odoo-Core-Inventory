import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { BsClockHistory, BsSearch, BsFilter } from 'react-icons/bs';

const TypeBadge = ({ type }) => {
    const colors = {
        'receipt': { bg: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: 'rgba(74, 222, 128, 0.3)' },
        'delivery': { bg: 'rgba(192, 132, 252, 0.1)', color: '#c084fc', border: 'rgba(192, 132, 252, 0.3)' },
        'transfer': { bg: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', border: 'rgba(96, 165, 250, 0.3)' },
        'adjustment': { bg: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
    };
    const style = colors[type] || colors['receipt'];
    return (
        <span style={{
            background: style.bg, color: style.color, border: `1px solid ${style.border}`,
            padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem',
            fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px'
        }}>
            {type}
        </span>
    );
};

export const MovesView = () => {
    const [moves, setMoves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('');

    useEffect(() => {
        loadMoves();
    }, [typeFilter]);

    const loadMoves = async () => {
        setLoading(true);
        try {
            const params = typeFilter ? { type: typeFilter } : {};
            const res = await api.getMoves(params);
            setMoves(res.data);
        } catch (err) {
            console.error(err);
            setMoves([]);
        } finally {
            setLoading(false);
        }
    };

    const typeOptions = ['', 'receipt', 'delivery', 'transfer', 'adjustment'];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="title-primary" style={{ fontSize: '2rem' }}>
                        <BsClockHistory style={{ marginRight: '12px', color: 'var(--color-accent-gold-primary)' }} />
                        Stock Move History
                    </h1>
                    <p className="text-muted">Complete audit trail of every stock movement across all warehouses.</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <BsSearch style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-tertiary)' }} />
                    <input type="text" className="glass-input" placeholder="Search by product, SKU, or reference..." style={{ paddingLeft: '48px' }} />
                </div>
                <select
                    className="glass-input"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    style={{ width: '200px', appearance: 'none' }}
                >
                    {typeOptions.map(t => (
                        <option key={t} value={t} style={{ background: '#111' }}>
                            {t ? t.charAt(0).toUpperCase() + t.slice(1) : 'All Move Types'}
                        </option>
                    ))}
                </select>
            </div>

            {/* Data Table */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: 'var(--glass-border)' }}>
                        <tr>
                            {['Date', 'Type', 'Reference', 'Product', 'From', 'To', 'Qty', 'By'].map(h => (
                                <th key={h} style={{
                                    padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600,
                                    fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px'
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center' }}>Loading...</td></tr>
                        ) : moves.length === 0 ? (
                            <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center' }} className="text-muted">No stock moves found.</td></tr>
                        ) : moves.map(m => (
                            <tr key={m.id} className="glass-interactive" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    {new Date(m.timestamp).toLocaleString()}
                                </td>
                                <td style={{ padding: '16px 24px' }}><TypeBadge type={m.move_type} /></td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span className="gold-text" style={{ fontWeight: 600 }}>{m.reference}</span>
                                </td>
                                <td style={{ padding: '16px 24px', fontWeight: 500 }}>{m.product_name}</td>
                                <td style={{ padding: '16px 24px', fontSize: '0.9rem' }}>{m.from_location_display || '—'}</td>
                                <td style={{ padding: '16px 24px', fontSize: '0.9rem' }}>{m.to_location_display || '—'}</td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{m.quantity}</span>
                                </td>
                                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    {m.performed_by_name || '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
