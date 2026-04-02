import React, { useState } from 'react';
import {
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { fetchSubmissions, fetchRating, fetchUser } from '../services/api';
import { compareUsers, getRankInfo } from '../utils/dataProcessing';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export default function Compare() {
    const [handle1, setHandle1] = useState('');
    const [handle2, setHandle2] = useState('');
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

    const tooltipStyle = { background: 'rgba(13,17,23,0.97)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: '2px', fontFamily: 'Share Tech Mono', fontSize: '11px' };

    return (
        <div className="page-enter">
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-text-bright)' }}>
                    Compare <span style={{ color: 'var(--color-accent-green)' }}>Users</span>
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    Head-to-head comparison of two Codeforces profiles
                </p>
            </div>

            <form onSubmit={handleCompare} className="glass-card" style={{ marginBottom: '20px' }}>
                <div className="accent-line" style={{ background: 'var(--gradient-green)' }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: '160px' }}>
                        <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>User 1</label>
                        <input value={handle1} onChange={(e) => setHandle1(e.target.value)} placeholder="First handle..." className="input-field" />
                    </div>
                    <div style={{ fontSize: '18px', paddingBottom: '10px', color: 'var(--color-accent-green)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>VS</div>
                    <div style={{ flex: 1, minWidth: '160px' }}>
                        <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>User 2</label>
                        <input value={handle2} onChange={(e) => setHandle2(e.target.value)} placeholder="Second handle..." className="input-field" />
                    </div>
                    <button type="submit" className="btn-primary-filled" disabled={loading} style={{ padding: '12px 24px' }}>
                        {loading ? '⏳' : '⚡'} Compare
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
                                        style={{ width: '56px', height: '56px', borderRadius: '2px', border: `2px solid ${rank.color}`, margin: '0 auto 10px', objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = 'https://userpic.codeforces.org/no-title.jpg'; }} />
                                    <h3 style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-display)' }} className={rank.className}>{h}</h3>
                                    <span className="status-tag" style={{ marginTop: '6px', background: `${rank.color}15`, color: rank.color, borderColor: `${rank.color}30` }}>{rank.rank}</span>
                                    <p style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-code)', color: rank.color, marginTop: '10px', textShadow: `0 0 15px ${rank.color}30` }}>{user.rating || '—'}</p>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '10px', fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                                        <span>Solved: <strong style={{ color: 'var(--color-text-bright)' }}>{stats.totalSolved}</strong></span>
                                        <span>Accuracy: <strong style={{ color: 'var(--color-text-bright)' }}>{stats.acceptRate}%</strong></span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Radar Chart */}
                    <div className="glass-card" style={{ marginBottom: '20px' }}>
                        <h2 className="section-title">■ Tag Strength Comparison</h2>
                        <ResponsiveContainer width="100%" height={320}>
                            <RadarChart data={comparison.radarData}>
                                <PolarGrid stroke="rgba(0,255,65,0.1)" />
                                <PolarAngleAxis dataKey="tag" tick={{ fill: '#8b949e', fontSize: 10, fontFamily: 'Share Tech Mono' }} />
                                <PolarRadiusAxis tick={{ fill: '#484f58', fontSize: 9 }} />
                                <Radar name={handle1.trim()} dataKey="user1" stroke="#00ff41" fill="#00ff41" fillOpacity={0.15} />
                                <Radar name={handle2.trim()} dataKey="user2" stroke="#ffb800" fill="#ffb800" fillOpacity={0.15} />
                                <Legend /><Tooltip contentStyle={tooltipStyle} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Bar Chart */}
                    <div className="glass-card" style={{ marginBottom: '20px' }}>
                        <h2 className="section-title">■ Difficulty Distribution</h2>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={comparison.mergedRatingDist}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,65,0.06)" />
                                <XAxis dataKey="rating" stroke="#484f58" tick={{ fontSize: 10, fontFamily: 'Share Tech Mono' }} />
                                <YAxis stroke="#484f58" tick={{ fontSize: 10, fontFamily: 'Share Tech Mono' }} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar dataKey="user1" name={handle1.trim()} fill="#00ff41" radius={[2,2,0,0]} />
                                <Bar dataKey="user2" name={handle2.trim()} fill="#ffb800" radius={[2,2,0,0]} />
                                <Legend />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Common Contests */}
                    {comparison.commonContests.length > 0 && (
                        <div className="glass-card-static">
                            <div className="accent-line" style={{ background: 'var(--gradient-green)' }} />
                            <h2 className="section-title">■ Common Contests ({comparison.commonContests.length})</h2>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-color-dim)' }}>
                                            <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '10px' }}>Contest</th>
                                            <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--color-accent-green)', fontWeight: 600, fontSize: '10px' }}>{handle1.trim()}</th>
                                            <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--color-accent-amber)', fontWeight: 600, fontSize: '10px' }}>{handle2.trim()}</th>
                                            <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '10px' }}>Winner</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparison.commonContests.slice(0, 20).map((c) => (
                                            <tr key={c.contestId} style={{ borderBottom: '1px solid rgba(48,54,61,0.3)' }}>
                                                <td style={{ padding: '8px 12px', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text-secondary)' }}>{c.contestName}</td>
                                                <td style={{ textAlign: 'center', padding: '8px 12px' }}>
                                                    <span style={{ color: 'var(--color-accent-green)' }}>#{c.rank1}</span>
                                                    <span style={{ marginLeft: '6px', color: c.change1 >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)', fontSize: '10px' }}>{c.change1 >= 0 ? '+' : ''}{c.change1}</span>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '8px 12px' }}>
                                                    <span style={{ color: 'var(--color-accent-amber)' }}>#{c.rank2}</span>
                                                    <span style={{ marginLeft: '6px', color: c.change2 >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)', fontSize: '10px' }}>{c.change2 >= 0 ? '+' : ''}{c.change2}</span>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '8px 12px' }}>
                                                    <span className="status-tag" style={{
                                                        background: c.rank1 < c.rank2 ? 'rgba(0,255,65,0.08)' : c.rank2 < c.rank1 ? 'rgba(255,184,0,0.08)' : 'rgba(139,148,158,0.08)',
                                                        color: c.rank1 < c.rank2 ? 'var(--color-accent-green)' : c.rank2 < c.rank1 ? 'var(--color-accent-amber)' : 'var(--color-text-secondary)',
                                                        borderColor: c.rank1 < c.rank2 ? 'rgba(0,255,65,0.2)' : c.rank2 < c.rank1 ? 'rgba(255,184,0,0.2)' : 'rgba(139,148,158,0.2)',
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
