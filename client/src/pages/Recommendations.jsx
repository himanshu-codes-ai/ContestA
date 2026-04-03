import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRecommendations, fetchUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getRankInfo } from '../utils/dataProcessing';
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

export default function Recommendations() {
    const { handle } = useParams();
    const navigate = useNavigate();
    const { profile } = useAuth();
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

    if (!finalHandle) {
        return (
            <div className="prompt-state page-enter">
                <div style={{ fontSize: '48px', marginBottom: '8px', animation: 'float 3s ease-in-out infinite', color: 'var(--color-accent-green)', textShadow: '0 0 30px rgba(0, 255, 65, 0.4)' }}>◆</div>
                <h2>Problem Recommendations</h2>
                <p>Set your Codeforces handle in your profile to get personalized recommendations.</p>
                <div style={{ marginTop: 12 }}>
                    <button className="btn-primary" onClick={() => navigate('/profile')}>Go to Profile</button>
                </div>
            </div>
        );
    }

    if (loading) return <LoadingSpinner message={`Analyzing ${finalHandle}'s recent contests...`} />;
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
                        <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'var(--font-sans)', color: 'var(--color-text-bright)' }}>
                            Recommendations
                        </h1>
                        <span className="status-tag">Live</span>
                    </div>
                    <button onClick={loadData} disabled={loading} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                        ↻ Refresh
                    </button>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px', fontFamily: 'var(--font-sans)' }}>
                    Based on your last 6 contests + 20 recent submissions ·{' '}
                    <span className={rankInfo.className} style={{ fontWeight: 600 }}>{finalHandle}</span>
                    {' '}· Rating{' '}
                    <span style={{ color: rankInfo.color, fontWeight: 600 }}>{userRating}</span>
                    {' '}· Target{' '}
                    <span style={{ color: 'var(--color-accent-cyan)' }}>{userRating + 100}–{userRating + 200}</span>
                </p>
            </div>

            {/* ── Top 5 Weak Tags ── */}
            {weakTags.length > 0 && (
                <div className="glass-card-static" style={{ marginBottom: '20px' }}>
                    <div className="accent-line" style={{ background: 'var(--gradient-red)' }} />
                    <h2 className="section-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-red)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Your Top 5 Weak Tags
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {weakTags.map((wt, i) => (
                            <div key={wt.tag} style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 16px',
                                background: 'rgba(239, 68, 68, 0.04)',
                                border: '1px solid rgba(239, 68, 68, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                animation: `fadeInUp 0.3s ease forwards`,
                                animationDelay: `${i * 0.05}s`,
                                opacity: 0,
                            }}>
                                <span style={{
                                    width: '22px', height: '22px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    fontSize: '10px', fontWeight: 700,
                                    fontFamily: 'var(--font-code)',
                                    color: '#ef4444',
                                }}>
                                    {i + 1}
                                </span>
                                <span style={{
                                    fontSize: '13px', fontWeight: 500,
                                    fontFamily: 'var(--font-sans)',
                                    color: 'var(--color-text-bright)',
                                }}>
                                    {wt.tag}
                                </span>
                                <span style={{
                                    fontSize: '11px', fontWeight: 600,
                                    fontFamily: 'var(--font-code)',
                                    color: 'var(--color-text-muted)',
                                    background: 'rgba(255,255,255,0.04)',
                                    padding: '2px 6px',
                                    borderRadius: 'var(--radius-sm)',
                                }}>
                                    {wt.count} missed
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── 10 Recommended Problems ── */}
            <div className="glass-card-static">
                <div className="accent-line" style={{ background: 'var(--gradient-green)' }} />
                <h2 className="section-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-green)" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    10 Problems to Practice
                </h2>

                {recommendations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
                            No matching problems found. Try participating in more contests.
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>#</th>
                                    <th>Problem</th>
                                    <th style={{ width: '80px' }}>Rating</th>
                                    <th>Tags</th>
                                    <th style={{ width: '80px' }}>Solved</th>
                                    <th style={{ width: '100px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {recommendations.map((rec, i) => (
                                    <tr key={rec.problemID} style={{ cursor: 'pointer' }} onClick={() => window.open(rec.link, '_blank')}>
                                        <td style={{ fontFamily: 'var(--font-code)', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '12px' }}>
                                            {i + 1}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--color-text-bright)', fontSize: '13px' }}>
                                                {rec.name}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-code)', marginTop: '2px' }}>
                                                {rec.problemID}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: 'var(--radius-full)',
                                                fontSize: '12px', fontWeight: 700,
                                                fontFamily: 'var(--font-code)',
                                                color: ratingColor(rec.rating),
                                                background: `${ratingColor(rec.rating)}10`,
                                            }}>
                                                {rec.rating}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                                                {rec.tags.slice(0, 3).map((tag) => (
                                                    <span key={tag} className="tag-chip" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ fontFamily: 'var(--font-code)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                            {rec.solvedCount?.toLocaleString() || '?'}
                                        </td>
                                        <td>
                                            <button
                                                className="btn-primary-filled"
                                                style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 600 }}
                                                onClick={(e) => { e.stopPropagation(); window.open(rec.link, '_blank'); }}
                                            >
                                                Solve Now
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
