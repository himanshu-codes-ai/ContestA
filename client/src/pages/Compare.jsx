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
        setLoading(true);
        setError(null);
        try {
            const [u1, u2, s1, s2, r1, r2] = await Promise.all([
                fetchUser(handle1.trim()),
                fetchUser(handle2.trim()),
                fetchSubmissions(handle1.trim()),
                fetchSubmissions(handle2.trim()),
                fetchRating(handle1.trim()),
                fetchRating(handle2.trim()),
            ]);
            setUser1(u1);
            setUser2(u2);
            setComparison(compareUsers(s1, s2, r1, r2));
        } catch (err) {
            setError(err.response?.data?.comment || err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page-enter">
            <h1 className="text-2xl font-bold mb-6">⚔️ Compare Users</h1>

            {/* Input Form */}
            <form onSubmit={handleCompare} className="glass-card" style={{ marginBottom: '24px' }}>
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1" style={{ minWidth: '180px' }}>
                        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>User 1</label>
                        <input value={handle1} onChange={(e) => setHandle1(e.target.value)} placeholder="Handle #1" className="input-field" />
                    </div>
                    <div style={{ fontSize: '24px', paddingBottom: '8px', color: 'var(--color-text-muted)' }}>vs</div>
                    <div className="flex-1" style={{ minWidth: '180px' }}>
                        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>User 2</label>
                        <input value={handle2} onChange={(e) => setHandle2(e.target.value)} placeholder="Handle #2" className="input-field" />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? '⏳' : '⚔️'} Compare
                    </button>
                </div>
            </form>

            {loading && <LoadingSpinner message="Comparing users..." />}
            {error && <ErrorState message={error} onRetry={() => handleCompare({ preventDefault: () => { } })} />}

            {comparison && user1 && user2 && (
                <>
                    {/* Profile Comparison */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        {[
                            { user: user1, stats: comparison.stats1, handle: handle1.trim() },
                            { user: user2, stats: comparison.stats2, handle: handle2.trim() },
                        ].map(({ user, stats, handle: h }) => {
                            const rank = getRankInfo(user.rating);
                            return (
                                <div key={h} className="glass-card" style={{ textAlign: 'center' }}>
                                    <img
                                        src={user.titlePhoto || 'https://userpic.codeforces.org/no-title.jpg'}
                                        alt={h}
                                        style={{
                                            width: '60px', height: '60px', borderRadius: '50%',
                                            border: `3px solid ${rank.color}`, margin: '0 auto 12px', objectFit: 'cover',
                                        }}
                                        onError={(e) => { e.target.src = 'https://userpic.codeforces.org/no-title.jpg'; }}
                                    />
                                    <h3 className={`text-lg font-bold ${rank.className}`}>{h}</h3>
                                    <p className="text-sm" style={{ color: rank.color }}>{rank.rank}</p>
                                    <p className="text-2xl font-bold mt-2" style={{ fontFamily: 'var(--font-mono)', color: rank.color }}>
                                        {user.rating || '—'}
                                    </p>
                                    <div className="flex justify-center gap-6 mt-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                        <span>Solved: <strong style={{ color: 'var(--color-text-primary)' }}>{stats.totalSolved}</strong></span>
                                        <span>Accept: <strong style={{ color: 'var(--color-text-primary)' }}>{stats.acceptRate}%</strong></span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Radar Chart */}
                    <div className="glass-card" style={{ marginBottom: '24px' }}>
                        <h2 className="section-title">🏷️ Tag Strengths</h2>
                        <ResponsiveContainer width="100%" height={350}>
                            <RadarChart data={comparison.radarData}>
                                <PolarGrid stroke="rgba(148,163,184,0.15)" />
                                <PolarAngleAxis dataKey="tag" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                                <Radar name={handle1.trim()} dataKey="user1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                                <Radar name={handle2.trim()} dataKey="user2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                                <Legend />
                                <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Rating Distribution Comparison */}
                    <div className="glass-card" style={{ marginBottom: '24px' }}>
                        <h2 className="section-title">📊 Difficulty Distribution</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={comparison.mergedRatingDist}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                                <XAxis dataKey="rating" stroke="#64748b" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                                <Bar dataKey="user1" name={handle1.trim()} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="user2" name={handle2.trim()} fill="#ef4444" radius={[4, 4, 0, 0]} />
                                <Legend />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Common Contests */}
                    {comparison.commonContests.length > 0 && (
                        <div className="glass-card">
                            <h2 className="section-title">🏆 Common Contests ({comparison.commonContests.length})</h2>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>Contest</th>
                                            <th style={{ textAlign: 'center', padding: '10px 12px', color: '#3b82f6', fontWeight: 600 }}>{handle1.trim()}</th>
                                            <th style={{ textAlign: 'center', padding: '10px 12px', color: '#ef4444', fontWeight: 600 }}>{handle2.trim()}</th>
                                            <th style={{ textAlign: 'center', padding: '10px 12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>Winner</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparison.commonContests.slice(0, 20).map((c) => (
                                            <tr key={c.contestId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '10px 12px', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {c.contestName}
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                                                    <span style={{ fontFamily: 'var(--font-mono)' }}>#{c.rank1}</span>
                                                    <span style={{ marginLeft: '8px', color: c.change1 >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)', fontSize: '12px' }}>
                                                        {c.change1 >= 0 ? '+' : ''}{c.change1}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                                                    <span style={{ fontFamily: 'var(--font-mono)' }}>#{c.rank2}</span>
                                                    <span style={{ marginLeft: '8px', color: c.change2 >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)', fontSize: '12px' }}>
                                                        {c.change2 >= 0 ? '+' : ''}{c.change2}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                                                    {c.rank1 < c.rank2 ? '🔵' : c.rank2 < c.rank1 ? '🔴' : '🤝'}
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
