import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchUpsolve } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

const ratingColor = (r) => {
    if (!r) return '#52525b';
    if (r >= 2400) return '#ef4444';
    if (r >= 2100) return '#f59e0b';
    if (r >= 1900) return '#8b5cf6';
    if (r >= 1600) return '#3b82f6';
    if (r >= 1400) return '#06b6d4';
    if (r >= 1200) return '#22c55e';
    return '#71717a';
};

const verdictBadgeColor = (verdict) => {
    if (verdict === 'WRONG_ANSWER') return '#ef4444';
    if (verdict === 'TIME_LIMIT_EXCEEDED') return '#f97316';
    return '#a1a1aa';
};

function ProblemRow({ problem, tier, delay }) {
    const isTriage = tier === 'triage';
    const badgeColor = isTriage ? verdictBadgeColor(problem.verdict) : '#8b5cf6';

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 14px',
            borderBottom: '1px solid var(--border-color-dim)',
            animation: `fadeInUp 0.3s ease forwards`,
            animationDelay: `${delay}s`,
            opacity: 0,
        }}>
            <span style={{
                fontFamily: 'var(--font-code)', fontSize: '11px', fontWeight: 600,
                color: 'var(--color-text-muted)', width: '24px', flexShrink: 0,
            }}>
                {problem.index}
            </span>

            <a href={problem.link} target="_blank" rel="noopener noreferrer" style={{
                flex: 1, color: 'var(--color-text-bright)', fontSize: '13px',
                fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-sans)',
                minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
                {problem.name}
            </a>

            {problem.rating ? (
                <span style={{
                    padding: '2px 8px', borderRadius: 'var(--radius-full)',
                    fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-code)',
                    color: ratingColor(problem.rating),
                    background: `${ratingColor(problem.rating)}10`,
                    flexShrink: 0,
                }}>
                    {problem.rating}
                </span>
            ) : <span style={{ width: '40px' }} />}

            {isTriage && (
                <span style={{
                    padding: '2px 6px', borderRadius: 'var(--radius-sm)',
                    fontSize: '9px', fontWeight: 700, fontFamily: 'var(--font-code)',
                    color: badgeColor, background: `${badgeColor}12`,
                    border: `1px solid ${badgeColor}20`, flexShrink: 0,
                }}>
                    {problem.verdictLabel}
                </span>
            )}

            <a href={problem.link} target="_blank" rel="noopener noreferrer"
                style={{
                    padding: '5px 12px', borderRadius: 'var(--radius-sm)',
                    fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-sans)',
                    color: '#000', background: badgeColor, textDecoration: 'none',
                    flexShrink: 0, transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
                Solve Now
            </a>
        </div>
    );
}

function ContestSection({ contest, delay }) {
    const hasTriage = contest.triage.length > 0;
    const hasChallenge = contest.challenge !== null;

    if (!hasTriage && !hasChallenge) return null;

    return (
        <div style={{
            marginBottom: '20px',
            animation: `fadeInUp 0.35s ease forwards`,
            animationDelay: `${delay}s`,
            opacity: 0,
        }}>
            <h3 style={{
                fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-sans)',
                color: 'var(--color-text-bright)', marginBottom: '10px',
                letterSpacing: '-0.01em',
            }}>
                {contest.contestName}
            </h3>

            {hasTriage && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.03)',
                    border: '1px solid rgba(239, 68, 68, 0.08)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '8px',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 14px',
                        borderBottom: '1px solid rgba(239, 68, 68, 0.08)',
                    }}>
                        <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: '#ef4444',
                            boxShadow: '0 0 6px rgba(239, 68, 68, 0.4)',
                        }} />
                        <span style={{
                            fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-code)',
                            color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                            Triage
                        </span>
                        <span style={{
                            fontSize: '10px', color: 'var(--color-text-muted)',
                            fontFamily: 'var(--font-sans)', marginLeft: '4px',
                        }}>
                            {contest.triage.length} failed
                        </span>
                    </div>
                    {contest.triage.map((p, i) => (
                        <ProblemRow key={p.problemID} problem={p} tier="triage" delay={delay + 0.05 * i} />
                    ))}
                </div>
            )}

            {hasChallenge && (
                <div style={{
                    background: 'rgba(139, 92, 246, 0.03)',
                    border: '1px solid rgba(139, 92, 246, 0.08)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 14px',
                        borderBottom: '1px solid rgba(139, 92, 246, 0.08)',
                    }}>
                        <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: '#8b5cf6',
                            boxShadow: '0 0 6px rgba(139, 92, 246, 0.4)',
                        }} />
                        <span style={{
                            fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-code)',
                            color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                            +1 Challenge
                        </span>
                    </div>
                    <ProblemRow problem={contest.challenge} tier="challenge" delay={delay + 0.1} />
                </div>
            )}
        </div>
    );
}

export default function UpsolvingTracker() {
    const { handle } = useParams();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const finalHandle = handle || profile?.cf_handle;
    useEffect(() => { if (finalHandle) loadData(); }, [finalHandle]);

    async function loadData() {
        setLoading(true); setError(null);
        try {
            setData(await fetchUpsolve(finalHandle));
        } catch (err) {
            setError(err.response?.data?.comment || err.message);
        } finally {
            setLoading(false);
        }
    }

    if (!finalHandle) {
        return (
            <div className="prompt-state page-enter">
                <div style={{ fontSize: '48px', marginBottom: '8px', animation: 'float 3s ease-in-out infinite', color: 'var(--color-accent-green)', textShadow: '0 0 30px rgba(0, 255, 65, 0.4)' }}>◆</div>
                <h2>Upsolving Tracker</h2>
                <p>Set your Codeforces handle in your profile to track failed attempts and +1 challenges.</p>
                <div style={{ marginTop: 12 }}>
                    <button className="btn-primary" onClick={() => navigate('/profile')}>Go to Profile</button>
                </div>
            </div>
        );
    }

    if (loading) return <LoadingSpinner message={`Fetching ${finalHandle}'s last 5 contests...`} />;
    if (error) return <ErrorState message={error} onRetry={loadData} />;
    if (!data) return null;

    const { contests, userRating } = data;
    const totalTriage = contests.reduce((sum, c) => sum + c.triage.length, 0);
    const totalChallenges = contests.filter((c) => c.challenge).length;

    if (contests.length === 0) {
        return (
            <div className="page-enter">
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--color-text-bright)', letterSpacing: '-0.02em' }}>
                        Upsolving Tracker
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px', fontFamily: 'var(--font-sans)' }}>
                        Based on your last 5 contests · {finalHandle}
                    </p>
                </div>
                <div className="glass-card-static" style={{ textAlign: 'center', padding: '60px 40px' }}>
                    <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
                        No contest rating history found. Participate in contests to start tracking.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-enter">
            {/* ── Header ── */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--color-text-bright)', letterSpacing: '-0.02em' }}>
                            Upsolving Tracker
                        </h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px', fontFamily: 'var(--font-sans)' }}>
                            Last 5 contests · {finalHandle} · Rating {userRating}
                        </p>
                    </div>
                    <button onClick={loadData} disabled={loading} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                        ↻ Refresh
                    </button>
                </div>

                {/* Stats bar */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.12)',
                        borderRadius: 'var(--radius-md)', padding: '10px 18px', textAlign: 'center',
                    }}>
                        <p style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-code)', color: '#ef4444' }}>
                            {totalTriage}
                        </p>
                        <p style={{ fontSize: '10px', fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Triage
                        </p>
                    </div>
                    <div style={{
                        background: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.12)',
                        borderRadius: 'var(--radius-md)', padding: '10px 18px', textAlign: 'center',
                    }}>
                        <p style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-code)', color: '#8b5cf6' }}>
                            {totalChallenges}
                        </p>
                        <p style={{ fontSize: '10px', fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Challenges
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Contest Sections ── */}
            {contests.map((contest, i) => (
                <ContestSection key={contest.contestId} contest={contest} delay={i * 0.08} />
            ))}

            {contests.every((c) => c.triage.length === 0 && !c.challenge) && (
                <div className="glass-card-static" style={{ textAlign: 'center', padding: '60px 40px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px', color: 'var(--color-accent-green)' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--font-sans)', color: 'var(--color-accent-green)' }}>
                        All caught up!
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', fontFamily: 'var(--font-sans)' }}>
                        No failed problems or +1 challenges in your last 5 contests. Great work!
                    </p>
                </div>
            )}
        </div>
    );
}
