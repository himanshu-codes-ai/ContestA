import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRecommendations, fetchUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getRankInfo } from '../utils/dataProcessing';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

const SOURCE_LABELS = {
    upsolve: { text: 'Upsolve', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.15)' },
    weakness: { text: 'Weakness', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.15)' },
    sweet_spot: { text: 'Sweet Spot', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.08)', border: 'rgba(6, 182, 212, 0.15)' },
};

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

export default function Recommendations() {
    const { handle } = useParams();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [inputHandle, setInputHandle] = useState('');
    const [data, setData] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const finalHandle = handle || profile?.cf_handle;
    useEffect(() => { if (finalHandle) loadData(); }, [finalHandle]);

    async function loadData() {
        setLoading(true); setError(null);
        try {
            const [recData, userData] = await Promise.all([
                fetchRecommendations(finalHandle),
                fetchUser(finalHandle),
            ]);
            setData(recData);
            setUser(userData);
        } catch (err) {
            setError(err.response?.data?.comment || err.message || 'Failed to generate recommendations');
        } finally {
            setLoading(false);
        }
    }

    // ── Prompt state ──
    if (!finalHandle) {
        return (
            <div className="prompt-state page-enter">
                <div style={{
                    fontSize: '48px', marginBottom: '8px',
                    animation: 'float 3s ease-in-out infinite',
                    color: 'var(--color-accent-green)',
                    textShadow: '0 0 30px rgba(0, 255, 65, 0.4)',
                }}>◆</div>
                <h2>Problem Recommendations</h2>
                <p>Set your Codeforces handle in your profile to get personalized recommendations.</p>
                <div style={{ marginTop: 12 }}>
                    <button className="btn-primary" onClick={() => navigate('/profile')}>Go to Profile</button>
                </div>
            </div>
        );
    }

    if (loading) return <LoadingSpinner message={`Analyzing ${finalHandle}'s profile & generating recommendations...`} />;
    if (error) return <ErrorState message={error} onRetry={loadData} />;
    if (!data) return null;

    const { recommendations, weakTags, strategicFocus, userRating } = data;
    const rankInfo = getRankInfo(user?.rating);

    return (
        <div className="page-enter">
            {/* ── Header ── */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <h1 style={{
                            fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em',
                            fontFamily: 'var(--font-sans)',
                            color: 'var(--color-text-bright)',
                        }}>
                            Recommendations
                        </h1>
                        <span className="status-tag">Live</span>
                    </div>
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                    >
                        {loading ? '⏳' : '↻'} Refresh
                    </button>
                </div>
                <p style={{
                    color: 'var(--color-text-muted)', fontSize: '14px',
                    marginTop: '4px', fontFamily: 'var(--font-sans)',
                }}>
                    Personalized for{' '}
                    <span className={rankInfo.className} style={{ fontWeight: 600 }}>{finalHandle}</span>
                    {' '}· Rating{' '}
                    <span style={{ color: rankInfo.color, fontWeight: 600 }}>{userRating}</span>
                    {' '}· Target zone{' '}
                    <span style={{ color: 'var(--color-accent-cyan)' }}>{userRating + 100}–{userRating + 300}</span>
                </p>
            </div>

            {/* ── Top Row: Diagnosis ── */}
            {weakTags.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '20px',
                    marginBottom: '20px'
                }}>
                    {/* Card 1: Identified Weaknesses */}
                    <div className="glass-card-static">
                        <div className="accent-line" style={{ background: 'var(--gradient-red)' }} />
                        <h2 className="section-title">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-red)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            Identified Weaknesses & Focus Areas
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {weakTags.slice(0, 2).map((wt, i) => (
                                <div key={wt.tag} style={{
                                    background: 'rgba(239, 68, 68, 0.04)',
                                    border: '1px solid rgba(239, 68, 68, 0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '16px',
                                    animation: `fadeInUp 0.4s ease forwards`,
                                    animationDelay: `${i * 0.1}s`,
                                    opacity: 0,
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <span style={{
                                            fontSize: '13px', fontWeight: 600,
                                            fontFamily: 'var(--font-sans)',
                                            color: 'var(--color-text-bright)',
                                        }}>
                                            {wt.tag}
                                        </span>
                                        <span style={{
                                            fontSize: '18px', fontWeight: 700,
                                            fontFamily: 'var(--font-code)',
                                            color: wt.accuracy < 30 ? '#ef4444' : wt.accuracy < 50 ? '#f59e0b' : '#22c55e',
                                        }}>
                                            {wt.accuracy}%
                                        </span>
                                    </div>
                                    <div style={{
                                        width: '100%', height: '4px', borderRadius: '2px',
                                        background: 'rgba(255, 255, 255, 0.06)',
                                    }}>
                                        <div style={{
                                            width: `${wt.accuracy}%`,
                                            height: '100%', borderRadius: '2px',
                                            background: wt.accuracy < 30 ? '#ef4444' : wt.accuracy < 50 ? '#f59e0b' : '#22c55e',
                                            transition: 'width 1s ease',
                                        }} />
                                    </div>
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        marginTop: '8px', fontSize: '11px',
                                        fontFamily: 'var(--font-sans)',
                                        color: 'var(--color-text-muted)',
                                    }}>
                                        <span>{wt.solved} solved</span>
                                        <span>{wt.attempted} attempted</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card 2: Strategic Focus */}
                    <div className="glass-card-static">
                        <div className="accent-line" style={{ background: 'var(--gradient-cyan)' }} />
                        <h2 className="section-title">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-cyan)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8l4 4-4 4M8 12h8"/></svg>
                            Strategic Focus
                        </h2>
                        <div style={{
                            display: 'flex', flexDirection: 'column', gap: '12px',
                            paddingTop: '4px',
                        }}>
                            {strategicFocus?.map((focusItem, j) => (
                                <div key={j} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                                    padding: '12px',
                                    background: 'rgba(0, 212, 255, 0.03)',
                                    border: '1px solid rgba(0, 212, 255, 0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    animation: `fadeInUp 0.4s ease forwards`,
                                    animationDelay: `${j * 0.1}s`,
                                    opacity: 0,
                                }}>
                                    <div style={{
                                        flexShrink: 0, marginTop: '2px',
                                        color: 'var(--color-accent-cyan)',
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                    </div>
                                    <p style={{
                                        fontSize: '13px', lineHeight: 1.5,
                                        fontFamily: 'var(--font-sans)',
                                        color: 'var(--color-text-secondary)',
                                    }}>
                                        {focusItem}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Recommendation Cards ── */}
            <div className="glass-card-static">
                <div className="accent-line" style={{ background: 'var(--gradient-green)' }} />
                <h2 className="section-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-green)" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Your Targeted Top 10 Practice Set
                </h2>

                {recommendations.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '60px 20px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto', display: 'block' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </div>
                        <p style={{
                            color: 'var(--color-text-secondary)', 
                            fontFamily: 'var(--font-sans)', 
                            fontSize: '14px',
                            marginBottom: '8px',
                        }}>
                            No recommendations available yet.
                        </p>
                        <p style={{
                            color: 'var(--color-text-muted)', 
                            fontFamily: 'var(--font-sans)', 
                            fontSize: '13px',
                            lineHeight: 1.6,
                            maxWidth: '420px',
                            margin: '0 auto',
                        }}>
                            Try solving a few more problems or participating in recent contests.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {recommendations.map((rec, i) => {
                            const src = SOURCE_LABELS[rec.source] || SOURCE_LABELS.sweet_spot;
                            return (
                                <div
                                    key={rec.problemID}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '18px 20px',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        animation: `fadeInUp 0.4s ease forwards`,
                                        animationDelay: `${i * 0.08}s`,
                                        opacity: 0,
                                    }}
                                    className="rec-card"
                                    onClick={() => window.open(rec.link, '_blank')}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--border-color-hover)';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--border-color)';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                                        background: `linear-gradient(90deg, transparent, ${src.color}30, transparent)`,
                                    }} />

                                    <div style={{
                                        display: 'flex', alignItems: 'flex-start',
                                        justifyContent: 'space-between', gap: '16px',
                                        flexWrap: 'wrap',
                                    }}>
                                        <div style={{ flex: 1, minWidth: '200px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                <span style={{
                                                    width: '26px', height: '26px', borderRadius: 'var(--radius-sm)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: 'rgba(255, 255, 255, 0.04)',
                                                    border: '1px solid var(--border-color)',
                                                    fontFamily: 'var(--font-code)', fontWeight: 700,
                                                    fontSize: '11px', color: 'var(--color-text-secondary)',
                                                    flexShrink: 0,
                                                }}>
                                                    {i + 1}
                                                </span>
                                                <div>
                                                    <div style={{
                                                        fontSize: '14px', fontWeight: 600,
                                                        fontFamily: 'var(--font-sans)',
                                                        color: 'var(--color-text-bright)',
                                                    }}>
                                                        {rec.name}
                                                    </div>
                                                    <span style={{
                                                        fontSize: '11px', fontFamily: 'var(--font-mono)',
                                                        color: 'var(--color-text-muted)',
                                                    }}>
                                                        {rec.problemID}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                                                {rec.tags.slice(0, 5).map((tag) => (
                                                    <span key={tag} className="tag-chip">{tag}</span>
                                                ))}
                                            </div>

                                            <div style={{
                                                marginTop: '10px', fontSize: '12px',
                                                fontFamily: 'var(--font-sans)',
                                                color: 'var(--color-text-secondary)',
                                                lineHeight: 1.5,
                                            }}>
                                                {rec.reason}
                                            </div>

                                            {rec.why && (
                                                <div style={{
                                                    marginTop: '6px', fontSize: '11px',
                                                    fontFamily: 'var(--font-sans)',
                                                    color: 'var(--color-text-muted)',
                                                    lineHeight: 1.6,
                                                    borderLeft: '2px solid rgba(255, 255, 255, 0.06)',
                                                    paddingLeft: '10px',
                                                }}>
                                                    {rec.why}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{
                                            display: 'flex', flexDirection: 'column',
                                            alignItems: 'flex-end', gap: '8px',
                                            flexShrink: 0,
                                        }}>
                                            {rec.rating && (
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: 'var(--radius-full)',
                                                    fontSize: '13px', fontWeight: 700,
                                                    fontFamily: 'var(--font-code)',
                                                    color: ratingColor(rec.rating),
                                                    background: `${ratingColor(rec.rating)}10`,
                                                    border: `1px solid ${ratingColor(rec.rating)}20`,
                                                }}>
                                                    {rec.rating}
                                                </span>
                                            )}

                                            <span style={{
                                                padding: '3px 10px', borderRadius: 'var(--radius-full)',
                                                fontSize: '10px', fontWeight: 500,
                                                fontFamily: 'var(--font-sans)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.04em',
                                                color: src.color,
                                                background: src.bg,
                                                border: `1px solid ${src.border}`,
                                            }}>
                                                {src.text}
                                            </span>

                                            <span style={{
                                                fontSize: '11px', fontFamily: 'var(--font-sans)',
                                                color: 'var(--color-text-muted)',
                                            }}>
                                                {rec.solvedCount?.toLocaleString() || '?'} solved
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Legend ── */}
            <div style={{
                marginTop: '20px', display: 'flex', gap: '20px',
                flexWrap: 'wrap', justifyContent: 'center',
            }}>
                {Object.entries(SOURCE_LABELS).map(([key, val]) => (
                    <div key={key} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '10px', fontFamily: 'var(--font-mono)',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                    }}>
                        <span style={{
                            width: '8px', height: '8px', borderRadius: '1px',
                            background: val.color, flexShrink: 0,
                        }} />
                        {val.text}
                    </div>
                ))}
            </div>
        </div>
    );
}
