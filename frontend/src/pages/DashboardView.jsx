import React from 'react';
import {
    BsBoxSeam, BsExclamationTriangle, BsArrowLeftRight,
    BsTruck, BsBoxArrowInDown, BsClockHistory
} from 'react-icons/bs';

const KPICard = ({ title, value, icon, color = "var(--color-accent-gold-primary)", trend }) => (
    <div className="glass-card glass-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0))`,
                border: 'var(--glass-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color, fontSize: '24px',
                boxShadow: `0 4px 20px ${color}20`
            }}>
                {icon}
            </div>
            {trend && (
                <span style={{
                    fontSize: '0.85rem', fontWeight: 600,
                    color: trend > 0 ? '#4ade80' : '#f87171',
                    background: trend > 0 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                    padding: '4px 8px', borderRadius: '20px'
                }}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>

        <div>
            <h3 className="text-muted" style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '4px' }}>{title}</h3>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
        </div>
    </div>
);

const ActivityRow = ({ action, reference, time, user, status }) => (
    <div className="glass-interactive" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '12px', margin: '4px 0', cursor: 'pointer'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.1)', color: 'var(--color-accent-gold-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
            }}>
                {user.charAt(0)}
            </div>
            <div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{action} <span className="gold-text">{reference}</span></p>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>by {user} • {time}</p>
            </div>
        </div>
        <span style={{
            fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
            padding: '4px 10px', borderRadius: '20px',
            background: status === 'Done' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(212, 175, 55, 0.1)',
            color: status === 'Done' ? '#4ade80' : 'var(--color-accent-gold-primary)',
            border: `1px solid ${status === 'Done' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(212, 175, 55, 0.2)'}`
        }}>
            {status}
        </span>
    </div>
);

export const DashboardView = () => {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const loadDashboard = async () => {
            try {
                // api relies on client.js which handles the JWT token automatically
                const { api } = await import('../api/client');
                const res = await api.getDashboard();
                setData(res.data);
            } catch (err) {
                console.error("Failed to load dashboard:", err);
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}><h1 className="title-primary">Loading Dashboard...</h1></div>;
    if (!data) return <div style={{ padding: '40px', color: '#f87171' }}>Failed to load dashboard data. Are you logged in?</div>;

    return (
        <div style={{ padding: '40px 6%', maxWidth: '1600px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h1 className="title-primary">Command Center</h1>
                    <p className="text-muted">Overview of your global inventory operations.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="glass-button"><BsBoxArrowInDown /> Receive</button>
                    <button className="glass-button"><BsTruck /> Deliver</button>
                    <button className="glass-button primary"><BsBoxSeam /> New Product</button>
                </div>
            </div>

            {/* KPI Grid */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px', marginBottom: '40px'
            }}>
                <KPICard title="Total Products" value={data.total_products} icon={<BsBoxSeam />} />
                <KPICard title="Low Stock Alerts" value={data.low_stock_items + data.out_of_stock_items} icon={<BsExclamationTriangle />} color="#f87171" />
                <KPICard title="Pending Receipts" value={data.pending_receipts} icon={<BsBoxArrowInDown />} color="#60a5fa" />
                <KPICard title="Scheduled Deliveries" value={data.pending_deliveries} icon={<BsTruck />} color="#c084fc" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

                {/* Main Content Area: Recent Activity */}
                <div className="glass-panel" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 className="title-secondary"><BsClockHistory style={{ marginRight: '8px', color: 'var(--color-accent-gold-primary)' }} /> Recent Activity</h2>
                        <button className="glass-button" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>View All</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {data.recent_moves?.length === 0 && <p className="text-muted">No recent stock moves.</p>}
                        {data.recent_moves?.map(move => (
                            <ActivityRow
                                key={move.id}
                                action={`${move.move_type.charAt(0).toUpperCase() + move.move_type.slice(1)}`}
                                reference={move.reference}
                                time={new Date(move.created_at).toLocaleDateString()}
                                user={move.performed_by_name || 'System'}
                                status="Done"
                            />
                        ))}
                    </div>
                </div>

                {/* Side Panel: Quick Actions / Low Stock Widget */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div className="glass-card hoverable" style={{ padding: '32px' }}>
                        <h2 className="title-secondary" style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Need Attention</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {data.out_of_stock_products?.slice(0, 3).map((item, idx) => (
                                <div key={idx} style={{ background: 'rgba(248, 113, 113, 0.05)', borderLeft: '3px solid #f87171', padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.product_name}</p>
                                    <p className="text-muted" style={{ fontSize: '0.8rem' }}>Stock: {item.quantity} • Min: {item.min_quantity} ({item.warehouse_name})</p>
                                </div>
                            ))}
                            {data.low_stock_products?.slice(0, 3).map((item, idx) => (
                                <div key={`low-${idx}`} style={{ background: 'rgba(212, 175, 55, 0.05)', borderLeft: '3px solid var(--color-accent-gold-primary)', padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.product_name}</p>
                                    <p className="text-muted" style={{ fontSize: '0.8rem' }}>Stock: {item.quantity} • Min: {item.min_quantity} ({item.warehouse_name})</p>
                                </div>
                            ))}
                            {data.out_of_stock_products?.length === 0 && data.low_stock_products?.length === 0 && (
                                <p className="text-muted">All stock levels are healthy.</p>
                            )}
                        </div>

                        <button className="glass-button" style={{ width: '100%', marginTop: '20px' }}>Run Replenishment</button>
                    </div>

                    <div className="glass-card hoverable" style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(0,0,0,0.2))' }}>
                        <h2 className="title-secondary" style={{ marginBottom: '8px', fontSize: '1.25rem' }}>System Status</h2>
                        <p className="text-muted" style={{ marginBottom: '16px' }}>All services are running normally. Last synced 2 mins ago.</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80', fontWeight: 600, fontSize: '0.9rem' }}>
                            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }}></span>
                            API Connected
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};
