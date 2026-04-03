import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRecommendations, fetchUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getRankInfo } from '../utils/dataProcessing';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

const SOURCE_LABELS = {
    upsolve: { text: 'Upsolve', color: '#ff9f43', bg: 'rgba(255, 159, 67, 0.1)', border: 'rgba(255, 159, 67, 0.25)' },
    weakness: { text: 'Weakness', color: '#ff3333', bg: 'rgba(255, 51, 51, 0.1)', border: 'rgba(255, 51, 51, 0.25)' },
    sweet_spot: { text: 'Sweet Spot', color: '#00d4ff', bg: 'rgba(0, 212, 255, 0.1)', border: 'rgba(0, 212, 255, 0.25)' },
};

const ratingColor = (r) => {
    if (!r) return '#484f58';
    if (r >= 2400) return '#ff3333';
    if (r >= 2100) return '#ffb800';
    if (r >= 1900) return '#bc8cff';
    if (r >= 1600) return '#58a6ff';
    if (r >= 1400) return '#03a89e';
    if (r >= 1200) return '#00ff41';
    return '#808080';
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

    const { recommendations, weakTags, userRating } = data;
    const rankInfo = getRankInfo(user?.rating);

    return (
        <div className="page-enter">
            {/* ── Header ── */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <h1 style={{
                            fontSize: '22px', fontWeight: 800,
                            fontFamily: 'var(--font-display)',
                            color: 'var(--color-text-bright)',
                        }}>
                            Recommendations
                        </h1>
                        <span className="status-tag">Live</span>
                    </div>
                    <button
                        onClick={loadData}
                        disabled={loading}
                        style={{
                            padding: '8px 16px', borderRadius: '2px',
                            background: 'rgba(0, 255, 65, 0.1)', border: '1px solid rgba(0, 255, 65, 0.2)',
                            color: 'var(--color-accent-green)', cursor: loading ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font-mono)', fontSize: '12px',
                            opacity: loading ? 0.5 : 1,
                        }}
                    >
                        {loading ? '⏳' : '🔄'} Refresh
                    </button>
                </div>
                <p style={{
                    color: 'var(--color-text-muted)', fontSize: '12px',
                    marginTop: '6px', fontFamily: 'var(--font-mono)',
                }}>
                    Personalized for{' '}
                    <span className={rankInfo.className} style={{ fontWeight: 700 }}>{finalHandle}</span>
                    {' '}· Rating{' '}
                    <span style={{ color: rankInfo.color, fontWeight: 700 }}>{userRating}</span>
                    {' '}· Target zone{' '}
                    <span style={{ color: 'var(--color-accent-cyan)' }}>{userRating + 100}–{userRating + 300}</span>
                </p>
            </div>

            {/* ── Weakness Summary ── */}
            {weakTags.length > 0 && (
                <div className="glass-card-static" style={{ marginBottom: '20px' }}>
                    <div className="accent-line" style={{ background: 'var(--gradient-red)' }} />
                    <h2 className="section-title">
                        <span style={{ color: 'var(--color-accent-red)' }}>⚠</span> Identified Weaknesses
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '14px',
                    }}>
                        {weakTags.map((wt, i) => (
                            <div key={wt.tag} style={{
                                background: 'rgba(255, 51, 51, 0.04)',
                                border: '1px solid rgba(255, 51, 51, 0.12)',
                                borderRadius: '2px',
                                padding: '16px',
                                animation: `fadeInUp 0.4s ease forwards`,
                                animationDelay: `${i * 0.1}s`,
                                opacity: 0,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{
                                        fontSize: '12px', fontWeight: 700,
                                        fontFamily: 'var(--font-mono)',
                                        color: 'var(--color-text-bright)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                    }}>
                                        {wt.tag}
                                    </span>
                                    <span style={{
                                        fontSize: '18px', fontWeight: 900,
                                        fontFamily: 'var(--font-code)',
                                        color: wt.accuracy < 30 ? '#ff3333' : wt.accuracy < 50 ? '#ffb800' : '#00ff41',
                                    }}>
                                        {wt.accuracy}%
                                    </span>
                                </div>
                                {/* Accuracy bar */}
                                <div style={{
                                    width: '100%', height: '4px', borderRadius: '2px',
                                    background: 'rgba(48, 54, 61, 0.6)',
                                }}>
                                    <div style={{
                                        width: `${wt.accuracy}%`,
                                        height: '100%', borderRadius: '2px',
                                        background: wt.accuracy < 30 ? '#ff3333' : wt.accuracy < 50 ? '#ffb800' : '#00ff41',
                                        transition: 'width 1s ease',
                                        boxShadow: `0 0 8px ${wt.accuracy < 30 ? 'rgba(255,51,51,0.4)' : wt.accuracy < 50 ? 'rgba(255,184,0,0.4)' : 'rgba(0,255,65,0.4)'}`,
                                    }} />
                                </div>
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    marginTop: '8px', fontSize: '10px',
                                    fontFamily: 'var(--font-mono)',
                                    color: 'var(--color-text-muted)',
                                }}>
                                    <span>{wt.solved} solved</span>
                                    <span>{wt.attempted} attempted</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Recommendation Cards ── */}
            <div className="glass-card-static">
                <div className="accent-line" style={{ background: 'var(--gradient-green)' }} />
                <h2 className="section-title">
                    <span style={{ color: 'var(--color-accent-green)' }}>◆</span> Top 5 Recommended Problems
                </h2>

                {recommendations.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '60px 20px',
                        background: 'rgba(255, 51, 51, 0.04)',
                        border: '1px solid rgba(255, 51, 51, 0.1)',
                        borderRadius: '2px',
                    }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.6 }}>🤔</div>
                        <p style={{
                            color: 'var(--color-text-secondary)', 
                            fontFamily: 'var(--font-mono)', 
                            fontSize: '13px',
                            marginBottom: '12px',
                        }}>
                            No recommendations available yet.
                        </p>
                        <p style={{
                            color: 'var(--color-text-muted)', 
                            fontFamily: 'var(--font-mono)', 
                            fontSize: '11px',
                            lineHeight: 1.6,
                            maxWidth: '420px',
                            margin: '0 auto',
                        }}>
                            Try solving a few more problems or participating in recent contests. Recommendations are based on your recent activity, weak tags, and unsolved contest problems.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {recommendations.map((rec, i) => {
                            const src = SOURCE_LABELS[rec.source] || SOURCE_LABELS.sweet_spot;
                            return (
                                <div
                                    key={rec.problemID}
                                    style={{
                                        background: 'rgba(13, 17, 23, 0.6)',
                                        border: '1px solid var(--border-color-dim)',
                                        borderRadius: '2px',
                                        padding: '18px 20px',
                                        transition: 'all 0.25s ease',
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
                                        e.currentTarget.style.boxShadow = 'var(--shadow-glow-green)';
                                        e.currentTarget.style.background = 'rgba(0, 255, 65, 0.03)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--border-color-dim)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.background = 'rgba(13, 17, 23, 0.6)';
                                    }}
                                >
                                    {/* Top line */}
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                                        background: `linear-gradient(90deg, transparent, ${src.color}40, transparent)`,
                                    }} />

                                    <div style={{
                                        display: 'flex', alignItems: 'flex-start',
                                        justifyContent: 'space-between', gap: '16px',
                                        flexWrap: 'wrap',
                                    }}>
                                        {/* Left: Problem info */}
                                        <div style={{ flex: 1, minWidth: '200px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                {/* Index badge */}
                                                <span style={{
                                                    width: '28px', height: '28px', borderRadius: '2px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: 'rgba(0, 255, 65, 0.08)',
                                                    border: '1px solid rgba(0, 255, 65, 0.2)',
                                                    fontFamily: 'var(--font-code)', fontWeight: 800,
                                                    fontSize: '12px', color: 'var(--color-accent-green)',
                                                    flexShrink: 0,
                                                }}>
                                                    {i + 1}
                                                </span>
                                                <div>
                                                    <div style={{
                                                        fontSize: '14px', fontWeight: 700,
                                                        fontFamily: 'var(--font-mono)',
                                                        color: 'var(--color-text-bright)',
                                                        letterSpacing: '0.02em',
                                                    }}>
                                                        {rec.name}
                                                    </div>
                                                    <span style={{
                                                        fontSize: '10px', fontFamily: 'var(--font-mono)',
                                                        color: 'var(--color-text-muted)',
                                                        letterSpacing: '0.04em',
                                                    }}>
                                                        {rec.problemID}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                                                {rec.tags.slice(0, 5).map((tag) => (
                                                    <span key={tag} className="tag-chip">{tag}</span>
                                                ))}
                                            </div>

                                            {/* Reason */}
                                            <div style={{
                                                marginTop: '10px', fontSize: '11px',
                                                fontFamily: 'var(--font-mono)',
                                                color: 'var(--color-text-secondary)',
                                                fontStyle: 'italic',
                                                letterSpacing: '0.02em',
                                                lineHeight: 1.5,
                                            }}>
                                                💡 {rec.reason}
                                            </div>

                                            {/* Why field */}
                                            {rec.why && (
                                                <div style={{
                                                    marginTop: '8px', fontSize: '10px',
                                                    fontFamily: 'var(--font-mono)',
                                                    color: 'var(--color-text-muted)',
                                                    lineHeight: 1.6,
                                                    borderLeft: '2px solid rgba(0, 255, 65, 0.2)',
                                                    paddingLeft: '10px',
                                                    opacity: 0.85,
                                                }}>
                                                    {rec.why}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right: Meta info */}
                                        <div style={{
                                            display: 'flex', flexDirection: 'column',
                                            alignItems: 'flex-end', gap: '8px',
                                            flexShrink: 0,
                                        }}>
                                            {/* Rating badge */}
                                            {rec.rating && (
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: '2px',
                                                    fontSize: '13px', fontWeight: 800,
                                                    fontFamily: 'var(--font-code)',
                                                    color: ratingColor(rec.rating),
                                                    background: `${ratingColor(rec.rating)}10`,
                                                    border: `1px solid ${ratingColor(rec.rating)}30`,
                                                    textShadow: `0 0 10px ${ratingColor(rec.rating)}40`,
                                                }}>
                                                    {rec.rating}
                                                </span>
                                            )}

                                            {/* Source label */}
                                            <span style={{
                                                padding: '3px 10px', borderRadius: '2px',
                                                fontSize: '9px', fontWeight: 600,
                                                fontFamily: 'var(--font-mono)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                                color: src.color,
                                                background: src.bg,
                                                border: `1px solid ${src.border}`,
                                            }}>
                                                {src.text}
                                            </span>

                                            {/* Solved count */}
                                            <span style={{
                                                fontSize: '10px', fontFamily: 'var(--font-mono)',
                                                color: 'var(--color-text-muted)',
                                                letterSpacing: '0.04em',
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
