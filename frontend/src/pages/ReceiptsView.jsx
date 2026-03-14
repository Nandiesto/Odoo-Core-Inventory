import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { BsBoxArrowInDown, BsCheckLg, BsX } from 'react-icons/bs';

export const ReceiptsView = () => {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReceipts();
    }, []);

    const loadReceipts = async () => {
        try {
            const res = await api.getReceipts();
            setReceipts(res.data);
        } catch (err) {
            console.error(err);
            // Dummy data
            setReceipts([
                { id: 1, reference: 'WH/IN/00102', supplier: 'TechCorp Solutions', status: 'ready', location_display: 'Main Warehouse / Receiving', scheduled_date: '2026-03-14' },
                { id: 2, reference: 'WH/IN/00103', supplier: 'Office Supplies Inc', status: 'draft', location_display: 'Main Warehouse / Stock', scheduled_date: '2026-03-15' },
                { id: 3, reference: 'WH/IN/00101', supplier: 'TechCorp Solutions', status: 'done', location_display: 'Main Warehouse / Stock', scheduled_date: '2026-03-10' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            'draft': { bg: 'rgba(255,255,255,0.05)', color: '#fff', border: 'rgba(255,255,255,0.2)' },
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

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="title-primary" style={{ fontSize: '2rem' }}>Incoming Receipts</h1>
                    <p className="text-muted">Process and validate vendor shipments receiving into your locations.</p>
                </div>
                <button className="glass-button primary">
                    <BsBoxArrowInDown style={{ fontSize: '1.2rem' }} /> New Receipt
                </button>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: 'var(--glass-border)' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Reference</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Supplier</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Scheduled Date</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Destination</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>Loading...</td></tr>
                        ) : receipts.map(r => (
                            <tr key={r.id} className="glass-interactive" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '16px 24px' }}><span className="gold-text" style={{ fontWeight: 600 }}>{r.reference}</span></td>
                                <td style={{ padding: '16px 24px', fontWeight: 500 }}>{r.supplier}</td>
                                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{r.scheduled_date}</td>
                                <td style={{ padding: '16px 24px' }}>{r.location_display}</td>
                                <td style={{ padding: '16px 24px' }}><StatusBadge status={r.status} /></td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    {r.status === 'ready' && (
                                        <button className="glass-button primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                                            <BsCheckLg /> Validate
                                        </button>
                                    )}
                                    {r.status === 'draft' && (
                                        <button className="glass-button" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#f87171' }}>
                                            <BsX /> Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};
