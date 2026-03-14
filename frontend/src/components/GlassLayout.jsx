import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    BsGrid1X2, BsBoxSeam, BsBoxArrowInDown,
    BsTruck, BsArrowLeftRight, BsClockHistory,
    BsGear, BsBoxArrowRight
} from 'react-icons/bs';

const SidebarItem = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `glass-button ${isActive ? 'primary' : ''}`}
        style={{
            width: '100%',
            justifyContent: 'flex-start',
            padding: '14px 20px',
            marginBottom: '8px',
            fontSize: '1rem'
        }}
    >
        <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>{icon}</span>
        {label}
    </NavLink>
);

export const GlassLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>

            {/* Sidebar - Glass Panel */}
            <aside className="glass-panel" style={{
                width: '280px',
                margin: '20px 0 20px 20px',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                position: 'sticky',
                top: '20px',
                height: 'calc(100vh - 40px)',
                zIndex: 100
            }}>
                <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, var(--color-accent-gold-primary), var(--color-accent-gold-hover))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 15px var(--color-accent-gold-glow)'
                        }}>
                            <span style={{ fontWeight: 800, color: '#000', fontSize: '1.2rem' }}>CI</span>
                        </div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.5px' }}>Core Inventory</h2>
                    </div>
                </div>

                <nav style={{ padding: '0 16px', flex: 1, overflowY: 'auto' }}>
                    <SidebarItem to="/dashboard" icon={<BsGrid1X2 />} label="Dashboard" />
                    <SidebarItem to="/products" icon={<BsBoxSeam />} label="Products" />

                    <div style={{ margin: '24px 0 8px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Operations
                    </div>
                    <SidebarItem to="/receipts" icon={<BsBoxArrowInDown />} label="Receipts" />
                    <SidebarItem to="/deliveries" icon={<BsTruck />} label="Deliveries" />
                    <SidebarItem to="/transfers" icon={<BsArrowLeftRight />} label="Transfers" />
                    <SidebarItem to="/moves" icon={<BsClockHistory />} label="Moves History" />

                    <div style={{ margin: '24px 0 8px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Configuration
                    </div>
                    <SidebarItem to="/warehouses" icon={<BsGrid1X2 />} label="Warehouses" />
                    <SidebarItem to="/locations" icon={<BsBoxArrowRight />} label="Locations" />
                </nav>

                <div style={{ padding: '24px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <SidebarItem to="/settings" icon={<BsGear />} label="Settings" />
                    <button
                        className="glass-button"
                        onClick={handleLogout}
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '14px 20px', color: '#f87171' }}
                    >
                        <span style={{ fontSize: '1.2rem', marginRight: '8px' }}><BsBoxArrowRight /></span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, padding: '20px', height: '100vh', overflowY: 'auto' }}>
                <Outlet />
            </main>

        </div>
    );
};
