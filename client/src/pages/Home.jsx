import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
    {
        icon: '📊',
        title: 'Performance Dashboard',
        desc: 'Dive deep into rating history, contest analysis, and statistics with interactive charts.',
        gradient: 'var(--gradient-primary)',
        delay: 1,
    },
    {
        icon: '🏷️',
        title: 'Topic & Difficulty',
        desc: 'Visualize your tag strengths with doughnut charts and identify skill gaps in difficulty levels.',
        gradient: 'var(--gradient-success)',
        delay: 2,
    },
    {
        icon: '📝',
        title: 'Upsolving Tracker',
        desc: 'Auto-discover unsolved problems from recent contests and track your upsolving progress.',
        gradient: 'var(--gradient-warm)',
        delay: 3,
    },
    {
        icon: '🔥',
        title: 'Submission Heatmap',
        desc: 'GitHub-style contribution graph showing your daily solving streak and activity patterns.',
        gradient: 'var(--gradient-cool)',
        delay: 4,
    },
    {
        icon: '⚔️',
        title: 'Head-to-Head Compare',
        desc: 'Side-by-side radar charts, common contests, and shared strengths between any two coders.',
        gradient: 'var(--gradient-sunset)',
        delay: 5,
    },
    {
        icon: '🏆',
        title: 'Contest Insights',
        desc: 'Analyze rank distribution, rating changes, and per-problem timing in specific rounds.',
        gradient: 'var(--gradient-premium)',
        delay: 6,
    },
];

const stats = [
    { value: '50K+', label: 'Contests Tracked' },
    { value: '200K+', label: 'Coders Analyzed' },
    { value: '6', label: 'Unique Dashboards' },
    { value: '∞', label: 'Free Forever' },
];

export default function Home() {
    const [handle, setHandle] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (handle.trim()) navigate(`/user/${handle.trim()}`);
    };

    return (
        <div className="page-enter">
            {/* Hero */}
            <section style={{ textAlign: 'center', padding: '56px 0 36px', maxWidth: '680px', margin: '0 auto' }}>
                {/* Badge */}
                <div className="badge badge-blue" style={{ marginBottom: '24px' }}>
                    ⚡ Competitive Programming Analytics
                </div>

                {/* Headline */}
                <h1 style={{
                    fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 900,
                    lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: '20px',
                }}>
                    Analyze Your{' '}
                    <span className="gradient-text">Codeforces</span>
                    <br />
                    Performance
                </h1>

                <p style={{
                    fontSize: '16px', color: 'var(--color-text-secondary)',
                    maxWidth: '500px', margin: '0 auto 40px', lineHeight: 1.7,
                }}>
                    Interactive dashboards, topic analysis, head-to-head comparisons,
                    and powerful insights for your competitive programming journey.
                </p>

                {/* Search */}
                <form onSubmit={handleSearch} style={{ maxWidth: '520px', margin: '0 auto' }}>
                    <div style={{
                        display: 'flex', gap: '12px', padding: '6px',
                        background: 'rgba(12, 16, 36, 0.6)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-2xl)',
                        transition: 'all 0.3s ease',
                    }}>
                        <input
                            type="text"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            placeholder="Enter Codeforces handle..."
                            className="search-input-lg"
                            style={{ border: 'none', background: 'transparent', borderRadius: 'var(--radius-xl)' }}
                        />
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{
                                borderRadius: 'var(--radius-xl)', padding: '14px 28px',
                                fontSize: '14px', whiteSpace: 'nowrap', flexShrink: 0,
                            }}
                        >
                            Analyze →
                        </button>
                    </div>
                </form>

                {/* Suggested handles */}
                <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Try:</span>
                    {['tourist', 'Benq', 'jiangly', 'ecnerwala'].map((h) => (
                        <button
                            key={h}
                            onClick={() => { setHandle(h); }}
                            style={{
                                background: 'rgba(136, 146, 176, 0.06)', border: '1px solid var(--border-color)',
                                color: 'var(--color-accent-cyan)', cursor: 'pointer', borderRadius: '6px',
                                fontFamily: 'var(--font-mono)', fontSize: '12px', padding: '3px 10px',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => { e.target.style.borderColor = 'var(--border-color-hover)'; e.target.style.background = 'rgba(0, 212, 255, 0.06)'; }}
                            onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.background = 'rgba(136, 146, 176, 0.06)'; }}
                        >
                            {h}
                        </button>
                    ))}
                </div>
            </section>

            {/* Stats row */}
            <section style={{
                display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap',
                padding: '32px 0 48px', maxWidth: '700px', margin: '0 auto',
            }}>
                {stats.map((s) => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                        <p style={{
                            fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)',
                            letterSpacing: '-0.02em',
                        }} className="gradient-text">
                            {s.value}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{s.label}</p>
                    </div>
                ))}
            </section>

            {/* Features Grid */}
            <section style={{ maxWidth: '960px', margin: '0 auto', padding: '0 0 60px' }}>
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <h2 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                        Everything you need to <span className="gradient-text-green">level up</span>
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                        Six powerful dashboards built for competitive programmers
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px',
                }}>
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className={`glass-card stagger-${f.delay}`}
                            style={{ cursor: 'default', animationFillMode: 'backwards' }}
                        >
                            <div className="accent-line" style={{ background: f.gradient }} />

                            <div style={{
                                width: '44px', height: '44px', borderRadius: '12px',
                                background: 'rgba(136, 146, 176, 0.06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '22px', marginBottom: '16px',
                            }}>
                                {f.icon}
                            </div>

                            <h3 style={{
                                fontSize: '15px', fontWeight: 700, marginBottom: '8px',
                                letterSpacing: '-0.01em',
                            }}>
                                {f.title}
                            </h3>
                            <p style={{
                                fontSize: '13px', color: 'var(--color-text-secondary)',
                                lineHeight: 1.65,
                            }}>
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={{
                textAlign: 'center', padding: '40px 0 60px',
                maxWidth: '560px', margin: '0 auto',
            }}>
                <div className="glass-card-static" style={{ padding: '40px', textAlign: 'center' }}>
                    <div className="accent-line" style={{ background: 'var(--gradient-aurora)' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px' }}>
                        Ready to get started?
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                        Enter any Codeforces handle above and unlock your analytics dashboard.
                    </p>
                    <button
                        onClick={() => document.querySelector('.search-input-lg')?.focus()}
                        className="btn-primary"
                    >
                        Get Started →
                    </button>
                </div>
            </section>
        </div>
    );
}
