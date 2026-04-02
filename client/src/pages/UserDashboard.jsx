import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import { fetchUser, fetchRating, fetchSubmissions } from '../services/api';
import { getOverallStats, getVerdictDistribution, getRankInfo, formatDate } from '../utils/dataProcessing';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

const VERDICT_COLORS = ['#00ff41', '#ff3333', '#ffb800', '#bc8cff', '#00d4ff', '#ff6b6b', '#484f58', '#58a6ff'];

export default function UserDashboard() {
    const { handle } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [ratingHistory, setRatingHistory] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => { if (handle) loadData(); }, [handle]);

    async function loadData() {
        setLoading(true); setError(null);
        try {
            const [u, r, s] = await Promise.all([fetchUser(handle), fetchRating(handle), fetchSubmissions(handle)]);
            setUser(u); setRatingHistory(r); setSubmissions(s);
        } catch (err) { setError(err.response?.data?.comment || err.message || 'Failed to fetch data'); }
        finally { setLoading(false); }
    }

    if (!handle) {
        return (
            <div className="prompt-state page-enter">
                <div style={{ fontSize: '40px', marginBottom: '8px', animation: 'float 3s ease-in-out infinite', color: 'var(--color-accent-green)' }}>◈</div>
                <h2>User Dashboard</h2>
                <p>Enter a Codeforces handle to view full profile analytics</p>
                <form onSubmit={(e) => { e.preventDefault(); const v = e.target.handle.value.trim(); if (v) navigate(`/user/${v}`); }} style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '400px' }}>
                    <input name="handle" placeholder="Codeforces handle..." className="input-field" />
                    <button type="submit" className="btn-primary">Analyze →</button>
                </form>
            </div>
        );
    }

    if (loading) return <LoadingSpinner message={`Loading ${handle}'s profile...`} />;
    if (error) return <ErrorState message={error} onRetry={loadData} />;

    const stats = getOverallStats(submissions);
    const verdicts = getVerdictDistribution(submissions);
    const rankInfo = getRankInfo(user?.rating);
    const chartData = ratingHistory.map((r) => ({
        name: r.contestName?.substring(0, 30) || '',
        date: formatDate(r.ratingUpdateTimeSeconds),
        rating: r.newRating,
        change: r.newRating - r.oldRating,
    }));
    const lastChange = ratingHistory.length ? ratingHistory[ratingHistory.length - 1].newRating - ratingHistory[ratingHistory.length - 1].oldRating : 0;

    return (
        <div className="page-enter">
            {/* Profile Header */}
            <div className="glass-card-static" style={{ marginBottom: '20px', padding: '28px' }}>
                <div className="accent-line" style={{ background: `linear-gradient(90deg, ${rankInfo.color}, transparent)` }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
                    <img
                        src={user?.titlePhoto || 'https://userpic.codeforces.org/no-title.jpg'}
                        alt={handle}
                        style={{ width: '72px', height: '72px', borderRadius: '2px', border: `2px solid ${rankInfo.color}`, objectFit: 'cover', boxShadow: `0 0 15px ${rankInfo.color}33` }}
                        onError={(e) => { e.target.src = 'https://userpic.codeforces.org/no-title.jpg'; }}
                    />
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-display)' }}>
                            <span className={rankInfo.className}>{handle}</span>
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <span className="status-tag" style={{ background: `${rankInfo.color}15`, color: rankInfo.color, borderColor: `${rankInfo.color}30` }}>
                                {rankInfo.rank}
                            </span>
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                            {user?.organization || 'No organization'} {user?.country ? `· ${user.country}` : ''}
                        </p>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                            <Link to={`/topics/${handle}`} className="btn-ghost">🏷️ Topics</Link>
                            <Link to={`/heatmap/${handle}`} className="btn-ghost">▣ Heatmap</Link>
                            <Link to={`/upsolving/${handle}`} className="btn-ghost">◎ Upsolve</Link>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'var(--font-code)', color: rankInfo.color, lineHeight: 1, textShadow: `0 0 20px ${rankInfo.color}40` }}>
                            {user?.rating || '—'}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                            {rankInfo.rank}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                            Max: <span style={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>{user?.maxRating || '—'}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stat-grid" style={{ marginBottom: '20px' }}>
                <StatCard icon="✅" label="Problems Solved" value={stats.totalSolved} color="var(--gradient-green)" />
                <StatCard icon="📤" label="Total Submissions" value={stats.totalAttempts} color="var(--gradient-cyan)" />
                <StatCard icon="🎯" label="Accept Rate" value={`${stats.acceptRate}%`} color="var(--gradient-amber)" />
                <StatCard icon="📈" label="Current Rating" value={user?.rating || '—'} trend={lastChange} color="var(--gradient-green)" />
                <StatCard icon="🏆" label="Max Rating" value={user?.maxRating || '—'} subtitle={user?.maxRank} color="var(--gradient-amber)" />
                <StatCard icon="🎮" label="Contests" value={ratingHistory.length} color="var(--gradient-cyan)" />
            </div>

            {/* Rating Chart */}
            <div className="glass-card-static" style={{ marginBottom: '20px' }}>
                <h2 className="section-title">📈 Rating History</h2>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00ff41" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#00ff41" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 65, 0.06)" />
                            <XAxis dataKey="date" stroke="#484f58" tick={{ fontSize: 10, fontFamily: 'Share Tech Mono' }} interval="preserveStartEnd" />
                            <YAxis stroke="#484f58" tick={{ fontSize: 10, fontFamily: 'Share Tech Mono' }} domain={['dataMin - 100', 'dataMax + 100']} />
                            <Tooltip contentStyle={{ background: 'rgba(13,17,23,0.97)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: '2px', fontFamily: 'Share Tech Mono', fontSize: '11px' }}
                                labelStyle={{ color: '#00ff41', fontWeight: 600 }} itemStyle={{ color: '#00ff41' }}
                                formatter={(val) => [val, 'Rating']}
                            />
                            <Area type="monotone" dataKey="rating" stroke="#00ff41" strokeWidth={2} fill="url(#ratingGrad)" dot={false} activeDot={{ r: 4, fill: '#00ff41', stroke: '#0a0e0f', strokeWidth: 2 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '60px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>No rating history found</p>
                )}
            </div>

            {/* Verdict Distribution */}
            <div className="glass-card-static">
                <h2 className="section-title">📋 Verdict Distribution</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '32px' }}>
                    <div style={{ flex: '0 0 240px' }}>
                        <ResponsiveContainer width={240} height={240}>
                            <PieChart>
                                <Pie data={verdicts} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={2} strokeWidth={0}>
                                    {verdicts.map((_, i) => <Cell key={i} fill={VERDICT_COLORS[i % VERDICT_COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'rgba(13,17,23,0.97)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: '2px', fontFamily: 'Share Tech Mono', fontSize: '11px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {verdicts.slice(0, 8).map((v, i) => (
                            <div key={v.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '1px', background: VERDICT_COLORS[i % VERDICT_COLORS.length], flexShrink: 0 }} />
                                <span style={{ color: 'var(--color-text-secondary)', flex: 1, fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{v.name}</span>
                                <span style={{ fontFamily: 'var(--font-code)', fontWeight: 700, fontSize: '12px', color: 'var(--color-text-bright)' }}>{v.value}</span>
                                <div style={{ width: '60px', height: '3px', borderRadius: '1px', background: 'rgba(48,54,61,0.5)' }}>
                                    <div style={{ height: '100%', borderRadius: '1px', background: VERDICT_COLORS[i % VERDICT_COLORS.length], width: `${(v.value / verdicts[0].value) * 100}%`, transition: 'width 0.5s ease' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
