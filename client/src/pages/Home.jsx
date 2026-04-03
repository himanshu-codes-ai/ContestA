import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
    {
        icon: '📊',
        title: 'Skill Gap Analysis',
        desc: 'Identify your weak topic areas and difficulty tiers with precision. Cross-validated proficiency metrics against top competitive programmers.',
        stat: '98.42%',
        statLabel: 'Accuracy',
        accent: 'var(--color-accent-green)',
    },
    {
        icon: '⚔️',
        title: 'Battle Mode',
        desc: 'Ghost-track rating-matched rivals. Compare strategies and counter tactical pivots via head-to-head competition replays.',
        accent: 'var(--color-accent-amber)',
    },
    {
        icon: '📝',
        title: 'Upsolving Pipeline',
        desc: 'Smart prioritization of unsolved contest problems. Minimize wasted effort by targeting high-impact problems based on your growth trajectory.',
        stat: '3.4x',
        statLabel: 'Speed boost',
        stat2: '12%',
        stat2Label: 'Rating gain',
        accent: 'var(--color-accent-green)',
    },
    {
        icon: '🔥',
        title: 'Activity Heatmap',
        desc: 'GitHub-style contribution graph showing your daily solving streak and coding activity patterns over the past year.',
        accent: 'var(--color-accent-cyan)',
    },
    {
        icon: '🏷️',
        title: 'Topic & Difficulty',
        desc: 'Visualize your tag strengths with charts and identify skill gaps across different difficulty levels.',
        accent: 'var(--color-accent-green)',
    },
    {
        icon: '🏆',
        title: 'Contest Insights',
        desc: 'Analyze rank distribution, rating changes, and per-problem timing across all your competitive rounds.',
        accent: 'var(--color-accent-amber)',
    },
];

const stats = [
    { value: '50K+', label: 'Contests Tracked' },
    { value: '200K+', label: 'Coders Analyzed' },
    { value: '6', label: 'Dashboards' },
    { value: '∞', label: 'Free Forever' },
];

export default function Home() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    return (
        <div className="page-enter">
            {/* Hero Section */}
            <section style={{ textAlign: 'center', padding: '56px 0 32px', maxWidth: '720px', margin: '0 auto' }}>
                {/* System status badge */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '4px 14px', marginBottom: '24px',
                    fontSize: '11px', fontFamily: 'var(--font-mono)',
                    color: 'var(--color-accent-green)',
                    background: 'rgba(0, 255, 65, 0.06)',
                    border: '1px solid rgba(0, 255, 65, 0.15)',
                    borderRadius: '2px', letterSpacing: '0.04em',
                }}>
                    <span className="status-online"></span>
                    ⚡ Competitive Programming Analytics
                </div>

                {/* Main headline */}
                <h1 style={{
                    fontSize: 'clamp(36px, 6vw, 58px)',
                    fontWeight: 900,
                    lineHeight: 1.05,
                    letterSpacing: '-0.02em',
                    marginBottom: '20px',
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-text-bright)',
                }}>
                    Maximize Your{' '}
                    <br />
                    <span style={{
                        color: 'var(--color-accent-green)',
                        fontStyle: 'italic',
                        textShadow: '0 0 40px rgba(0, 255, 65, 0.4), 0 0 80px rgba(0, 255, 65, 0.15)',
                    }}>
                        Codeforces
                    </span>{' '}
                    Performance
                </h1>

                <p style={{
                    fontSize: '14px', color: 'var(--color-text-secondary)',
                    maxWidth: '500px', margin: '0 auto 36px', lineHeight: 1.7,
                    fontFamily: 'var(--font-mono)',
                }}>
                    Interactive dashboards, topic analysis, head-to-head comparisons,
                    and powerful insights for your competitive programming journey.
                </p>

                {/* CTA Buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => document.querySelector('.search-input-lg')?.focus()}
                        className="btn-primary-filled"
                        style={{ padding: '14px 32px', fontSize: '13px' }}
                    >
                        Get Started
                    </button>
                    <button
                        onClick={() => navigate('/compare')}
                        className="btn-primary"
                        style={{ padding: '14px 32px', fontSize: '13px' }}
                    >
                        ⚔️ Compare Users
                    </button>
                </div>

                {/* CTAs: analyze your profile or search others on the dedicated Search page */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
                    <button
                        onClick={() => navigate('/user')}
                        className="btn-primary-filled"
                        style={{ padding: '12px 26px', fontSize: '13px' }}
                    >
                        Analyze My Profile
                    </button>
                    <button
                        onClick={() => navigate('/search')}
                        className="btn-primary"
                        style={{ padding: '12px 26px', fontSize: '13px' }}
                    >
                        🔎 Find a Profile
                    </button>
                </div>
            </section>

            {/* Terminal Window Mockup */}
            <section style={{ maxWidth: '800px', margin: '0 auto 32px' }}>
                <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--border-color-dim)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--border-color-dim)', background: 'rgba(19, 25, 32, 0.8)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f57' }} />
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#febc2e' }} />
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28c840' }} />
                        <span style={{ marginLeft: '12px', fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                            cf-analyzer ~/analytics
                        </span>
                    </div>
                    <div style={{ padding: '20px', fontSize: '12px', fontFamily: 'var(--font-mono)', lineHeight: 1.8 }}>
                        <p style={{ color: 'var(--color-accent-green)' }}>$ cf-analyze --init</p>
                        <p style={{ color: 'var(--color-text-muted)' }}>[✓] Codeforces API connected</p>
                        <p style={{ color: 'var(--color-text-muted)' }}>[✓] Rating history module loaded</p>
                        <p style={{ color: 'var(--color-text-muted)' }}>[✓] Topic analysis ready</p>
                        <p style={{ color: 'var(--color-text-muted)' }}>[✓] Upsolving tracker online</p>
                        <p style={{ color: 'var(--color-text-muted)' }}>[✓] Heatmap renderer active</p>
                        <p style={{ color: 'var(--color-accent-green)', marginTop: '8px' }}>
                            All systems ready. Enter a handle to begin.
                            <span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats row */}
            <section style={{
                display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap',
                padding: '24px 0 40px', maxWidth: '700px', margin: '0 auto',
                borderTop: '1px solid var(--border-color-dim)',
                borderBottom: '1px solid var(--border-color-dim)',
            }}>
                {stats.map((s) => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                        <p style={{
                            fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-code)',
                            letterSpacing: '-0.01em', color: 'var(--color-accent-green)',
                            textShadow: '0 0 15px rgba(0, 255, 65, 0.2)',
                        }}>
                            {s.value}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{s.label}</p>
                    </div>
                ))}
            </section>

            {/* Features Grid */}
            <section style={{ maxWidth: '960px', margin: '40px auto', padding: '0' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{
                        fontSize: '24px', fontWeight: 800, letterSpacing: '0.01em', marginBottom: '8px',
                        fontFamily: 'var(--font-display)', color: 'var(--color-text-bright)',
                    }}>
                        Everything you need to <span style={{ color: 'var(--color-accent-green)', textShadow: '0 0 15px rgba(0, 255, 65, 0.3)' }}>level up</span>
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                        Six powerful dashboards built for competitive programmers
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {features.map((f, idx) => (
                        <div key={f.title} className={`glass-card stagger-${idx + 1}`} style={{ cursor: 'default', animationFillMode: 'backwards', padding: '24px' }}>
                            <div className="accent-line" style={{ background: f.accent }} />
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '2px',
                                background: 'rgba(0, 255, 65, 0.04)', border: '1px solid rgba(0, 255, 65, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '20px', marginBottom: '14px',
                            }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-bright)' }}>
                                {f.title}
                            </h3>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.7, fontFamily: 'var(--font-mono)' }}>
                                {f.desc}
                            </p>
                            {f.stat && (
                                <div style={{ display: 'flex', gap: '24px', marginTop: '14px', borderTop: '1px solid var(--border-color-dim)', paddingTop: '12px' }}>
                                    <div>
                                        <p style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-code)', color: f.accent }}>{f.stat}</p>
                                        <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{f.statLabel}</p>
                                    </div>
                                    {f.stat2 && (
                                        <div>
                                            <p style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-code)', color: 'var(--color-text-bright)' }}>{f.stat2}</p>
                                            <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{f.stat2Label}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ textAlign: 'center', padding: '48px 0 60px', maxWidth: '600px', margin: '0 auto' }}>
                <h2 style={{
                    fontSize: '26px', fontWeight: 900, marginBottom: '12px',
                    fontFamily: 'var(--font-display)', color: 'var(--color-text-bright)',
                }}>
                    Ready to get started?
                </h2>
                <p style={{
                    color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '28px',
                    fontFamily: 'var(--font-mono)', maxWidth: '420px', margin: '0 auto 28px',
                }}>
                    Join thousands of competitive programmers using low-latency analytics
                    to improve their Codeforces performance.
                </p>
                <button
                    onClick={() => document.querySelector('.search-input-lg')?.focus()}
                    className="btn-primary-filled"
                    style={{ padding: '14px 36px', fontSize: '13px' }}
                >
                    Get Started →
                </button>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid var(--border-color-dim)', padding: '28px 0', maxWidth: '960px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-accent-green)', textShadow: '0 0 10px rgba(0, 255, 65, 0.2)' }}>
                        CF Analyzer
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Built for competitive programmers · Free & open source
                    </p>
                </div>
            </footer>
        </div>
    );
}
