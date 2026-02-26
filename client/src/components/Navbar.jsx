import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
    { path: '/', label: 'Home', icon: '⌂', exact: true },
    { path: '/user', label: 'Dashboard', icon: '◈' },
    { path: '/topics', label: 'Topics', icon: '◉' },
    { path: '/upsolving', label: 'Upsolving', icon: '◎' },
    { path: '/heatmap', label: 'Heatmap', icon: '▣' },
    { path: '/compare', label: 'Compare', icon: '⇔' },
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
                    position: 'fixed', top: '16px', left: '16px', zIndex: 60,
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'var(--color-bg-elevated)', border: '1px solid var(--border-color)',
                    color: 'var(--color-text-primary)', cursor: 'pointer',
                    display: 'none', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                    backdropFilter: 'blur(12px)',
                }}
                className="mobile-nav-toggle"
            >
                {mobileOpen ? '✕' : '☰'}
            </button>
            <style>{`.mobile-nav-toggle { display: none !important; } @media (max-width: 1024px) { .mobile-nav-toggle { display: flex !important; } }`}</style>

            {/* Overlay */}
            {mobileOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(5,8,22,0.7)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setMobileOpen(false)}
                    className="mobile-only"
                />
            )}

            {/* Sidebar */}
            <nav
                style={{
                    position: 'fixed', top: 0, left: 0, height: '100vh', width: '280px', zIndex: 50,
                    display: 'flex', flexDirection: 'column',
                    background: 'rgba(8, 12, 30, 0.85)',
                    backdropFilter: 'blur(32px) saturate(1.5)',
                    WebkitBackdropFilter: 'blur(32px) saturate(1.5)',
                    borderRight: '1px solid var(--border-color)',
                    transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: mobileOpen ? 'translateX(0)' : undefined,
                }}
                className={`nav-sidebar ${mobileOpen ? '' : 'nav-hidden-mobile'}`}
            >
                <style>{`
          @media (max-width: 1024px) {
            .nav-hidden-mobile { transform: translateX(-100%) !important; }
          }
        `}</style>

                {/* Logo */}
                <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border-color)' }}>
                    <div className="flex items-center gap-3">
                        <div style={{
                            width: '42px', height: '42px', borderRadius: '12px',
                            background: 'var(--gradient-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '20px', boxShadow: 'var(--shadow-glow-blue)',
                        }}>
                            ⚡
                        </div>
                        <div>
                            <h1 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                                <span className="gradient-text">CF Analyzer</span>
                            </h1>
                            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Contest Analytics
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div style={{ padding: '16px 20px' }}>
                    <form onSubmit={handleSearch}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                placeholder="Search handle..."
                                className="input-field"
                                style={{ fontSize: '13px', padding: '10px 38px 10px 14px', borderRadius: '10px' }}
                            />
                            <button
                                type="submit"
                                style={{
                                    position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--color-text-muted)', fontSize: '14px',
                                    transition: 'color 0.2s',
                                }}
                            >
                                🔍
                            </button>
                        </div>
                    </form>
                </div>

                {/* Nav Items */}
                <div style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <p style={{
                        fontSize: '10px', fontWeight: 600, color: 'var(--color-text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        padding: '8px 16px 6px', marginBottom: '4px',
                    }}>
                        Navigation
                    </p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            onClick={() => setMobileOpen(false)}
                            style={({ isActive }) => ({
                                display: 'flex', alignItems: 'center', gap: '14px',
                                padding: '11px 16px', borderRadius: '10px',
                                textDecoration: 'none', fontSize: '13px',
                                fontWeight: isActive ? 600 : 450,
                                color: isActive ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)',
                                background: isActive ? 'rgba(79, 143, 247, 0.1)' : 'transparent',
                                borderLeft: isActive ? '3px solid var(--color-accent-blue)' : '3px solid transparent',
                                transition: 'all 0.25s ease',
                                letterSpacing: '0.01em',
                            })}
                        >
                            <span style={{ fontSize: '16px', width: '20px', textAlign: 'center', opacity: 0.85 }}>{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{
                        padding: '14px 16px', borderRadius: '12px',
                        background: 'rgba(79, 143, 247, 0.06)', border: '1px solid rgba(79, 143, 247, 0.1)',
                    }}>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                            Pro Tip
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                            Use the search bar to quickly lookup any Codeforces handle.
                        </p>
                    </div>
                </div>
            </nav>
        </>
    );
}
