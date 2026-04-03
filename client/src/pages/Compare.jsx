import React, { useState } from 'react';
import {
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { fetchSubmissions, fetchRating, fetchUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { compareUsers, getRankInfo } from '../utils/dataProcessing';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export default function Compare() {
    const [handle1, setHandle1] = useState('');
    const [handle2, setHandle2] = useState('');
    const { profile } = useAuth();

    React.useEffect(() => { if (profile?.cf_handle) setHandle1(profile.cf_handle); }, [profile]);
    const [user1, setUser1] = useState(null);
    const [user2, setUser2] = useState(null);
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function handleCompare(e) {
        e.preventDefault();
        if (!handle1.trim() || !handle2.trim()) return;
        setLoading(true); setError(null);
            try {
            const [u1, u2, s1, s2, r1, r2] = await Promise.all([
                fetchUser(handle1.trim()), fetchUser(handle2.trim()),
                fetchSubmissions(handle1.trim()), fetchSubmissions(handle2.trim()),
                fetchRating(handle1.trim()), fetchRating(handle2.trim()),
            ]);
            setUser1(u1); setUser2(u2);
                setComparison(compareUsers(s1, s2, r1, r2));
        } catch (err) { setError(err.response?.data?.comment || err.message); }
        finally { setLoading(false); }
    }

    const tooltipStyle = { background: 'var(--color-bg-elevated)', border: '1px solid var(--border-color-hover)', borderRadius: '6px', fontFamily: 'var(--font-sans)', fontSize: '12px' };

    return (
        <div className="page-enter">
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--color-text-bright)', letterSpacing: '-0.02em' }}>
                    Compare Users
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px', fontFamily: 'var(--font-sans)' }}>
                    Head-to-head comparison of two Codeforces profiles
                </p>
            </div>

            <form onSubmit={handleCompare} className="glass-card" style={{ marginBottom: '20px' }}>
                <div className="accent-line" style={{ background: 'var(--gradient-green)' }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: '160px' }}>
                        <label style={{ fontSize: '12px', fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>User 1</label>
                        <input value={handle1} onChange={(e) => setHandle1(e.target.value)} placeholder="First handle..." className="input-field" />
                    </div>
                    <div style={{ fontSize: '13px', paddingBottom: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>vs</div>
                    <div style={{ flex: 1, minWidth: '160px' }}>
                        <label style={{ fontSize: '12px', fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>User 2</label>
                        <input value={handle2} onChange={(e) => setHandle2(e.target.value)} placeholder="Second handle..." className="input-field" />
                    </div>
                    <button type="submit" className="btn-primary-filled" disabled={loading} style={{ padding: '10px 22px' }}>
                        Compare
                    </button>
                </div>
            </form>

            {loading && <LoadingSpinner message="Comparing users..." />}
            {error && <ErrorState message={error} onRetry={() => handleCompare({ preventDefault: () => {} })} />}

            {comparison && user1 && user2 && (
                <>
                    {/* Profile Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                        {[{ user: user1, stats: comparison.stats1, h: handle1.trim(), accent: 'var(--color-accent-green)' },
                          { user: user2, stats: comparison.stats2, h: handle2.trim(), accent: 'var(--color-accent-amber)' }].map(({ user, stats, h, accent }, idx) => {
                            const rank = getRankInfo(user.rating);
                            return (
                                <div key={h} className="glass-card" style={{ textAlign: 'center' }}>
                                    <div className="accent-line" style={{ background: accent }} />
                                    <img src={user.titlePhoto || 'https://userpic.codeforces.org/no-title.jpg'} alt={h}
                                        style={{ width: '56px', height: '56px', borderRadius: '50%', border: `2px solid ${rank.color}`, margin: '0 auto 10px', objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = 'https://userpic.codeforces.org/no-title.jpg'; }} />
                                    <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-sans)' }} className={rank.className}>{h}</h3>
                                    <span className="status-tag" style={{ marginTop: '6px', background: `${rank.color}12`, color: rank.color, borderColor: `${rank.color}20` }}>{rank.rank}</span>
                                    <p style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-code)', color: rank.color, marginTop: '10px', letterSpacing: '-0.02em' }}>{user.rating || '—'}</p>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '10px', fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}>
                                        <span>Solved: <strong style={{ color: 'var(--color-text-bright)' }}>{stats.totalSolved}</strong></span>
                                        <span>Accuracy: <strong style={{ color: 'var(--color-text-bright)' }}>{stats.acceptRate}%</strong></span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Radar Chart */}
                    <div className="glass-card" style={{ marginBottom: '20px' }}>
                        <h2 className="section-title">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            Tag Strength Comparison
                        </h2>
                        <ResponsiveContainer width="100%" height={320}>
                            <RadarChart data={comparison.radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                <PolarAngleAxis dataKey="tag" tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'var(--font-sans)' }} />
                                <PolarRadiusAxis tick={{ fill: '#52525b', fontSize: 10 }} />
                                <Radar name={handle1.trim()} dataKey="user1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.12} strokeWidth={2} />
                                <Radar name={handle2.trim()} dataKey="user2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.12} strokeWidth={2} />
                                <Legend /><Tooltip contentStyle={tooltipStyle} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Bar Chart */}
                    <div className="glass-card" style={{ marginBottom: '20px' }}>
                        <h2 className="section-title">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                            Difficulty Distribution
                        </h2>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={comparison.mergedRatingDist}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="rating" stroke="#52525b" tick={{ fontSize: 11, fontFamily: 'var(--font-sans)' }} />
                                <YAxis stroke="#52525b" tick={{ fontSize: 11, fontFamily: 'var(--font-sans)' }} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar dataKey="user1" name={handle1.trim()} fill="#22c55e" radius={[4,4,0,0]} />
                                <Bar dataKey="user2" name={handle2.trim()} fill="#f59e0b" radius={[4,4,0,0]} />
                                <Legend />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Common Contests */}
                    {comparison.commonContests.length > 0 && (
                        <div className="glass-card-static">
                            <div className="accent-line" style={{ background: 'var(--gradient-green)' }} />
                            <h2 className="section-title">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                Common Contests ({comparison.commonContests.length})
                            </h2>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="premium-table">
                                    <thead>
                                        <tr>
                                            <th>Contest</th>
                                            <th style={{ textAlign: 'center' }}>{handle1.trim()}</th>
                                            <th style={{ textAlign: 'center' }}>{handle2.trim()}</th>
                                            <th style={{ textAlign: 'center' }}>Winner</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparison.commonContests.slice(0, 20).map((c) => (
                                            <tr key={c.contestId}>
                                                <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text-secondary)' }}>{c.contestName}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span style={{ color: 'var(--color-accent-green)', fontWeight: 600 }}>#{c.rank1}</span>
                                                    <span style={{ marginLeft: '6px', color: c.change1 >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)', fontSize: '11px' }}>{c.change1 >= 0 ? '+' : ''}{c.change1}</span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span style={{ color: 'var(--color-accent-amber)', fontWeight: 600 }}>#{c.rank2}</span>
                                                    <span style={{ marginLeft: '6px', color: c.change2 >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)', fontSize: '11px' }}>{c.change2 >= 0 ? '+' : ''}{c.change2}</span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span className="status-tag" style={{
                                                        background: c.rank1 < c.rank2 ? 'rgba(34,197,94,0.08)' : c.rank2 < c.rank1 ? 'rgba(245,158,11,0.08)' : 'rgba(161,161,170,0.08)',
                                                        color: c.rank1 < c.rank2 ? 'var(--color-accent-green)' : c.rank2 < c.rank1 ? 'var(--color-accent-amber)' : 'var(--color-text-secondary)',
                                                        borderColor: c.rank1 < c.rank2 ? 'rgba(34,197,94,0.15)' : c.rank2 < c.rank1 ? 'rgba(245,158,11,0.15)' : 'rgba(161,161,170,0.15)',
                                                    }}>
                                                        {c.rank1 < c.rank2 ? handle1.trim() : c.rank2 < c.rank1 ? handle2.trim() : 'Tie'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
