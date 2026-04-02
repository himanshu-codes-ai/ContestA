import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
    { path: '/', label: 'Home', icon: '⌂', exact: true },
    { path: '/user', label: 'Dashboard', icon: '◈' },
    { path: '/topics', label: 'Topics', icon: '◉' },
    { path: '/upsolving', label: 'Upsolving', icon: '◎' },
    { path: '/heatmap', label: 'Heatmap', icon: '▣' },
    { path: '/compare', label: 'Compare', icon: '⇔' },
    { path: '/recommend', label: 'Recommend', icon: '◆' },
];

export default function Navbar() {
    const [handle, setHandle] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (handle.trim()) {
            navigate(`/user/${handle.trim()}`);
            setHandle('');
            setMobileOpen(false);
        }
    };

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                    position: 'fixed', top: '14px', left: '14px', zIndex: 60,
                    width: '40px', height: '40px', borderRadius: '2px',
                    background: 'var(--color-bg-elevated)', border: '1px solid var(--border-color-dim)',
                    color: 'var(--color-accent-green)', cursor: 'pointer',
                    display: 'none', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                    fontFamily: 'var(--font-mono)',
                }}
                className="mobile-nav-toggle"
            >
                {mobileOpen ? '✕' : '☰'}
            </button>
            <style>{`.mobile-nav-toggle { display: none !important; } @media (max-width: 1024px) { .mobile-nav-toggle { display: flex !important; } }`}</style>

            {/* Overlay */}
            {mobileOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(10,14,15,0.8)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <nav
                style={{
                    position: 'fixed', top: 0, left: 0, height: '100vh', width: '260px', zIndex: 50,
                    display: 'flex', flexDirection: 'column',
                    background: 'rgba(10, 14, 15, 0.97)',
                    borderRight: '1px solid var(--border-color-dim)',
                    transition: 'transform 0.3s ease',
                    transform: mobileOpen ? 'translateX(0)' : undefined,
                }}
                className={`nav-sidebar ${mobileOpen ? '' : 'nav-hidden-mobile'}`}
            >
                <style>{`
                    @media (max-width: 1024px) {
                        .nav-hidden-mobile { transform: translateX(-100%) !important; }
                    }
                `}</style>

                {/* Logo / Branding */}
                <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border-color-dim)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '2px',
                            background: 'rgba(0, 255, 65, 0.1)',
                            border: '1px solid rgba(0, 255, 65, 0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '16px', color: 'var(--color-accent-green)',
                        }}>
                            ⚡
                        </div>
                        <div>
                            <h1 style={{
                                fontSize: '15px', fontWeight: 700, letterSpacing: '0.02em',
                                fontFamily: 'var(--font-display)',
                                color: 'var(--color-accent-green)',
                                textShadow: '0 0 15px rgba(0, 255, 65, 0.3)',
                            }}>
                                CF Analyzer
                            </h1>
                            <p style={{
                                fontSize: '10px', color: 'var(--color-text-muted)',
                                letterSpacing: '0.04em',
                                fontFamily: 'var(--font-mono)', marginTop: '2px',
                            }}>
                                Contest Analytics <span className="status-online" style={{ marginLeft: '4px' }}></span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div style={{ padding: '14px 16px' }}>
                    <form onSubmit={handleSearch}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                placeholder="Search handle..."
                                className="input-field"
                                style={{ fontSize: '12px', padding: '9px 32px 9px 12px', borderRadius: '2px' }}
                            />
                            <button
                                type="submit"
                                style={{
                                    position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--color-text-muted)', fontSize: '12px',
                                }}
                            >
                                🔍
                            </button>
                        </div>
                    </form>
                </div>

                {/* Nav Items */}
                <div style={{ flex: 1, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            onClick={() => setMobileOpen(false)}
                            style={({ isActive }) => ({
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '10px 14px', borderRadius: '2px',
                                textDecoration: 'none', fontSize: '13px',
                                fontWeight: isActive ? 600 : 400,
                                fontFamily: 'var(--font-mono)',
                                color: isActive ? 'var(--color-accent-green)' : 'var(--color-text-secondary)',
                                background: isActive ? 'rgba(0, 255, 65, 0.08)' : 'transparent',
                                borderLeft: isActive ? '2px solid var(--color-accent-green)' : '2px solid transparent',
                                transition: 'all 0.2s ease',
                                letterSpacing: '0.02em',
                            })}
                        >
                            <span style={{ fontSize: '14px', width: '18px', textAlign: 'center', opacity: 0.7 }}>{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                {/* Initialize Button */}
                <div style={{ padding: '12px 16px' }}>
                    <button
                        onClick={() => navigate('/')}
                        className="btn-primary-filled"
                        style={{
                            width: '100%', justifyContent: 'center',
                            padding: '10px 16px', fontSize: '12px',
                        }}
                    >
                        ⚡ New Analysis
                    </button>
                </div>

                {/* Footer */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color-dim)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                            <span>⚙</span> Settings
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                            <span>⟲</span> Session
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}
