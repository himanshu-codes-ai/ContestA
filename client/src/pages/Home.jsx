import React from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
        ),
        title: 'Skill Gap Analysis',
        desc: 'Identify weak topic areas with precision. Cross-validated proficiency metrics against top competitive programmers.',
        accent: 'var(--color-accent-green)',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        ),
        title: 'Upsolving Pipeline',
        desc: 'Smart prioritization of unsolved contest problems. Target high-impact problems based on your growth trajectory.',
        accent: 'var(--color-accent-amber)',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
        ),
        title: 'Activity Heatmap',
        desc: 'GitHub-style contribution graph showing your daily solving streak and coding activity patterns.',
        accent: 'var(--color-accent-cyan)',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
        ),
        title: 'Topic & Difficulty',
        desc: 'Visualize tag strengths with charts and identify skill gaps across different difficulty levels.',
        accent: 'var(--color-accent-purple)',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        ),
        title: 'Compare Users',
        desc: 'Head-to-head comparison with rivals. Compare strategies and counter tactical pivots.',
        accent: 'var(--color-accent-blue)',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        ),
        title: 'Smart Recommendations',
        desc: 'Personalized problem suggestions based on your weaknesses, recent activity, and rating progression.',
        accent: 'var(--color-accent-green)',
    },
];

const stats = [
    { value: '50K+', label: 'Contests Tracked' },
    { value: '200K+', label: 'Coders Analyzed' },
    { value: '6', label: 'Dashboards' },
    { value: 'Free', label: 'Forever' },
];

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="page-enter">
            {/* Hero */}
            <section style={{ textAlign: 'center', padding: '64px 0 40px', maxWidth: '720px', margin: '0 auto' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '5px 14px', marginBottom: '28px',
                    fontSize: '12px', fontFamily: 'var(--font-sans)',
                    color: 'var(--color-accent-green)',
                    background: 'var(--color-accent-green-subtle)',
                    border: '1px solid rgba(34, 197, 94, 0.12)',
                    borderRadius: 'var(--radius-full)', fontWeight: 500,
                }}>
                    <span className="status-online"></span>
                    Competitive Programming Analytics
                </div>

                <h1 style={{
                    fontSize: 'clamp(36px, 6vw, 56px)',
                    fontWeight: 800,
                    lineHeight: 1.08,
                    letterSpacing: '-0.03em',
                    marginBottom: '20px',
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--color-text-bright)',
                }}>
                    Maximize Your{' '}
                    <span className="gradient-text">Codeforces</span>{' '}
                    Performance
                </h1>

                <p style={{
                    fontSize: '16px', color: 'var(--color-text-secondary)',
                    maxWidth: '520px', margin: '0 auto 36px', lineHeight: 1.7,
                    fontFamily: 'var(--font-sans)',
                }}>
                    Interactive dashboards, topic analysis, head-to-head comparisons,
                    and powerful insights for your competitive programming journey.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate('/user')}
                        className="btn-primary-filled"
                        style={{ padding: '12px 28px', fontSize: '14px' }}
                    >
                        Get Started
                    </button>
                    <button
                        onClick={() => navigate('/compare')}
                        className="btn-primary"
                        style={{ padding: '12px 28px', fontSize: '14px' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                        Compare Users
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '4px' }}>
                    <button
                        onClick={() => navigate('/search')}
                        className="btn-secondary"
                        style={{ padding: '10px 22px', fontSize: '13px' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        Find a Profile
                    </button>
                </div>
            </section>

            {/* Terminal Window */}
            <section style={{ maxWidth: '720px', margin: '0 auto 40px' }}>
                <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#febc2e' }} />
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840' }} />
                        <span style={{ marginLeft: '12px', fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                            cf-analyzer ~/analytics
                        </span>
                    </div>
                    <div style={{ padding: '20px', fontSize: '13px', fontFamily: 'var(--font-mono)', lineHeight: 2 }}>
                        <p style={{ color: 'var(--color-accent-green)' }}>$ cf-analyze --init</p>
                        <p style={{ color: 'var(--color-text-secondary)' }}>[✓] Codeforces API connected</p>
                        <p style={{ color: 'var(--color-text-secondary)' }}>[✓] Rating history module loaded</p>
                        <p style={{ color: 'var(--color-text-secondary)' }}>[✓] Topic analysis ready</p>
                        <p style={{ color: 'var(--color-text-secondary)' }}>[✓] Upsolving tracker online</p>
                        <p style={{ color: 'var(--color-text-secondary)' }}>[✓] Heatmap renderer active</p>
                        <p style={{ color: 'var(--color-accent-green)', marginTop: '8px' }}>
                            All systems ready. Enter a handle to begin.
                            <span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section style={{
                display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap',
                padding: '32px 0', maxWidth: '700px', margin: '0 auto',
                borderTop: '1px solid var(--border-color)',
                borderBottom: '1px solid var(--border-color)',
            }}>
                {stats.map((s) => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                        <p style={{
                            fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-code)',
                            letterSpacing: '-0.02em', color: 'var(--color-accent-green)',
                        }}>
                            {s.value}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', fontFamily: 'var(--font-sans)' }}>{s.label}</p>
                    </div>
                ))}
            </section>

            {/* Features */}
            <section style={{ maxWidth: '960px', margin: '48px auto', padding: '0' }}>
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <h2 style={{
                        fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px',
                        fontFamily: 'var(--font-sans)', color: 'var(--color-text-bright)',
                    }}>
                        Everything you need to <span className="gradient-text">level up</span>
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', fontFamily: 'var(--font-sans)' }}>
                        Six powerful dashboards built for competitive programmers
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    {features.map((f, idx) => (
                        <div key={f.title} className={`glass-card stagger-${idx + 1}`} style={{ cursor: 'default', animationFillMode: 'backwards', padding: '24px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                                background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '16px', color: f.accent,
                            }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-bright)', fontFamily: 'var(--font-sans)' }}>
                                {f.title}
                            </h3>
                            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, fontFamily: 'var(--font-sans)' }}>
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={{ textAlign: 'center', padding: '48px 0 64px', maxWidth: '600px', margin: '0 auto' }}>
                <h2 style={{
                    fontSize: '28px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em',
                    fontFamily: 'var(--font-sans)', color: 'var(--color-text-bright)',
                }}>
                    Ready to get started?
                </h2>
                <p style={{
                    color: 'var(--color-text-secondary)', fontSize: '15px', marginBottom: '28px',
                    fontFamily: 'var(--font-sans)', maxWidth: '420px', margin: '0 auto 28px',
                }}>
                    Join thousands of competitive programmers using analytics to improve their performance.
                </p>
                <button
                    onClick={() => navigate('/user')}
                    className="btn-primary-filled"
                    style={{ padding: '12px 32px', fontSize: '14px' }}
                >
                    Start Analyzing →
                </button>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid var(--border-color)', padding: '24px 0', maxWidth: '960px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-sans)', color: 'var(--color-accent-green)' }}>
                        CF Analyzer
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>
                        Built for competitive programmers · Free & open source
                    </p>
                </div>
            </footer>
        </div>
    );
}
