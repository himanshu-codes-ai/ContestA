import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { path: '/search', label: 'Find Profile', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    )},
    { path: '/', label: 'Home', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    )},
    { path: '/user', label: 'Dashboard', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    )},
    { path: '/topics', label: 'Topics', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
    )},
    { path: '/upsolving', label: 'Upsolving', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
    )},
    { path: '/heatmap', label: 'Heatmap', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
    )},
    { path: '/compare', label: 'Compare', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    )},
    { path: '/recommend', label: 'Recommend', icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    )},
];

export default function Navbar({ collapsed = false, onToggle }) {
    const { user, profile } = useAuth();
    const [handle, setHandle] = useState('');
    React.useEffect(() => { if (profile?.cf_handle) setHandle(profile.cf_handle); }, [profile]);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (handle.trim()) {
            const h = handle.trim();
            navigate(`/user/${h}`);
            if (profile?.cf_handle !== h) setHandle('');
            setMobileOpen(false);
        }
    };

    return (
        <>
            {/* Floating toggle button (visible when sidebar is collapsed) */}
            {collapsed && !mobileOpen && (
                <button
                    onClick={() => onToggle && onToggle()}
                    title="Expand sidebar"
                    style={{
                        position: 'fixed', top: '14px', left: '14px', zIndex: 55,
                        width: '40px', height: '40px', borderRadius: '8px',
                        background: 'var(--color-bg-card)', border: '1px solid var(--border-color)',
                        color: 'var(--color-text-secondary)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: 'var(--shadow-md)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-bright)'; e.currentTarget.style.borderColor = 'var(--border-color-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                </button>
            )}

            {/* Mobile toggle */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                    position: 'fixed', top: '14px', left: '14px', zIndex: 60,
                    width: '40px', height: '40px', borderRadius: '8px',
                    background: 'var(--color-bg-card)', border: '1px solid var(--border-color)',
                    color: 'var(--color-text-secondary)', cursor: 'pointer',
                    display: 'none', alignItems: 'center', justifyContent: 'center',
                }}
                className="mobile-nav-toggle"
            >
                {mobileOpen ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                )}
            </button>
            <style>{`.mobile-nav-toggle { display: none !important; } @media (max-width: 1024px) { .mobile-nav-toggle { display: flex !important; } }`}</style>

            {/* Overlay */}
            {mobileOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <nav
                style={{
                    position: 'fixed', top: 0, left: 0, height: '100vh', width: '260px', zIndex: 50,
                    display: 'flex', flexDirection: 'column',
                    background: 'var(--color-bg-secondary)',
                    borderRight: '1px solid var(--border-color)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                className={`nav-sidebar ${mobileOpen ? 'nav-mobile-open' : ''} ${collapsed ? 'nav-collapsed' : ''}`}
            >
                <style>{`
                    .nav-sidebar { transform: translateX(0); }
                    @media (max-width: 1024px) {
                        .nav-sidebar { transform: translateX(-100%) !important; }
                        .nav-mobile-open { transform: translateX(0) !important; }
                    }
                    .nav-collapsed { transform: translateX(-100%) !important; }
                    @media (max-width: 1024px) {
                        .nav-mobile-open.nav-collapsed { transform: translateX(-100%) !important; }
                    }
                `}</style>

                {/* Logo */}
                <div
                    style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                    onClick={() => onToggle && onToggle()}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: 'var(--color-accent-green-subtle)',
                            border: '1px solid rgba(34, 197, 94, 0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                        </div>
                        <div>
                            <h1 style={{
                                fontSize: '14px', fontWeight: 700, letterSpacing: '-0.02em',
                                fontFamily: 'var(--font-sans)',
                                color: 'var(--color-text-bright)',
                            }}>
                                CF Analyzer
                            </h1>
                            <p style={{
                                fontSize: '11px', color: 'var(--color-text-muted)',
                                fontFamily: 'var(--font-sans)', marginTop: '1px',
                            }}>
                                Contest Analytics <span className="status-online" style={{ marginLeft: '4px' }}></span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Nav Items */}
                <div style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            style={({ isActive }) => ({
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '9px 12px', borderRadius: '6px',
                                textDecoration: 'none', fontSize: '13px',
                                fontWeight: isActive ? 500 : 400,
                                fontFamily: 'var(--font-sans)',
                                color: isActive ? 'var(--color-text-bright)' : 'var(--color-text-secondary)',
                                background: isActive ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                                transition: 'all 0.15s ease',
                            })}
                        >
                            <span style={{ opacity: 0.6, display: 'flex' }}>{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                background: 'var(--color-accent-green-subtle)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '12px', fontWeight: 600, color: 'var(--color-accent-green)',
                            }}>
                                {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {profile?.full_name || user.email}
                                </p>
                                <NavLink to="/profile" onClick={() => setMobileOpen(false)} style={{ fontSize: '11px', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                                    View Profile
                                </NavLink>
                            </div>
                        </div>
                    ) : (
                        <button className="btn-primary-filled" onClick={() => { navigate('/login'); setMobileOpen(false); }} style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '8px 16px' }}>
                            Sign In
                        </button>
                    )}
                </div>
            </nav>
        </>
    );
}
