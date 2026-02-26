import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import { fetchUser, fetchRating, fetchSubmissions } from '../services/api';
import { getOverallStats, getVerdictDistribution, getRankInfo, formatDate } from '../utils/dataProcessing';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

const VERDICT_COLORS = ['#00e68c', '#ff4757', '#ff9f43', '#a855f7', '#00d4ff', '#f368e0', '#5a6380', '#4f8ff7'];

export default function UserDashboard() {
    const { handle } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [ratingHistory, setRatingHistory] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!handle) return;
        loadData();
    }, [handle]);

    async function loadData() {
        setLoading(true);
        setError(null);
        try {
            const [u, r, s] = await Promise.all([
                fetchUser(handle),
                fetchRating(handle),
                fetchSubmissions(handle),
            ]);
            setUser(u);
            setRatingHistory(r);
            setSubmissions(s);
        } catch (err) {
            setError(err.response?.data?.comment || err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }

    if (!handle) {
        return (
            <div className="prompt-state page-enter">
                <div style={{ fontSize: '48px', marginBottom: '8px', animation: 'float 3s ease-in-out infinite' }}>◈</div>
                <h2>User Dashboard</h2>
                <p>Enter a Codeforces handle to view their full profile analytics</p>
                <form onSubmit={(e) => { e.preventDefault(); const v = e.target.handle.value.trim(); if (v) navigate(`/user/${v}`); }} style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '400px' }}>
                    <input name="handle" placeholder="Codeforces handle..." className="input-field" />
                    <button type="submit" className="btn-primary">Go →</button>
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

    const lastChange = ratingHistory.length
        ? ratingHistory[ratingHistory.length - 1].newRating - ratingHistory[ratingHistory.length - 1].oldRating
        : 0;

    return (
        <div className="page-enter">
            {/* Profile Header */}
            <div className="glass-card-static" style={{ marginBottom: '24px', padding: '32px' }}>
                <div className="accent-line" style={{ background: `linear-gradient(90deg, ${rankInfo.color}, transparent)` }} />
                <div className="flex flex-wrap items-center gap-6">
                    <div style={{ position: 'relative' }}>
                        <img
                            src={user?.titlePhoto || 'https://userpic.codeforces.org/no-title.jpg'}
                            alt={handle}
                            style={{
                                width: '84px', height: '84px', borderRadius: '18px',
                                border: `2px solid ${rankInfo.color}`,
                                objectFit: 'cover', boxShadow: `0 0 20px ${rankInfo.color}33`,
                            }}
                            onError={(e) => { e.target.src = 'https://userpic.codeforces.org/no-title.jpg'; }}
                        />
                        <div style={{
                            position: 'absolute', bottom: '-4px', right: '-4px',
                            width: '24px', height: '24px', borderRadius: '8px',
                            background: rankInfo.color, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', border: '2px solid var(--color-bg-primary)',
                        }}>
                            ✓
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className={rankInfo.className}>{handle}</span>
                        </h1>
                        <p style={{ color: rankInfo.color, fontWeight: 700, fontSize: '13px', marginTop: '2px' }}>
                            {rankInfo.rank}
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                            {user?.organization || 'No organization'} {user?.country ? `· ${user.country}` : ''}
                        </p>
                        {/* Quick nav */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <Link to={`/topics/${handle}`} className="btn-ghost" style={{ fontSize: '12px', padding: '5px 12px' }}>🏷️ Topics</Link>
                            <Link to={`/heatmap/${handle}`} className="btn-ghost" style={{ fontSize: '12px', padding: '5px 12px' }}>🔥 Heatmap</Link>
                            <Link to={`/upsolving/${handle}`} className="btn-ghost" style={{ fontSize: '12px', padding: '5px 12px' }}>📝 Upsolve</Link>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{
                            fontSize: '36px', fontWeight: 900, fontFamily: 'var(--font-mono)',
                            color: rankInfo.color, letterSpacing: '-0.03em', lineHeight: 1,
                        }}>
                            {user?.rating || '—'}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                            Max: <span style={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>{user?.maxRating || '—'}</span>
                            <span style={{ marginLeft: '4px', opacity: 0.6 }}>({user?.maxRank || ''})</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stat-grid" style={{ marginBottom: '24px' }}>
                <StatCard icon="✅" label="Problems Solved" value={stats.totalSolved} color="var(--gradient-success)" />
                <StatCard icon="📤" label="Submissions" value={stats.totalAttempts} color="var(--gradient-primary)" />
                <StatCard icon="🎯" label="Accept Rate" value={`${stats.acceptRate}%`} color="var(--gradient-cool)" />
                <StatCard icon="📈" label="Current Rating" value={user?.rating || '—'} trend={lastChange} color="var(--gradient-warm)" />
                <StatCard icon="🏆" label="Max Rating" value={user?.maxRating || '—'} subtitle={user?.maxRank} color="var(--gradient-sunset)" />
                <StatCard icon="🎮" label="Contests" value={ratingHistory.length} color="var(--gradient-premium)" />
            </div>

            {/* Rating Chart */}
            <div className="glass-card-static" style={{ marginBottom: '24px' }}>
                <h2 className="section-title">📈 Rating History</h2>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f8ff7" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#4f8ff7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(136,146,176,0.06)" />
                            <XAxis dataKey="date" stroke="#5a6380" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                            <YAxis stroke="#5a6380" tick={{ fontSize: 11 }} domain={['dataMin - 100', 'dataMax + 100']} />
                            <Tooltip
                                contentStyle={{ background: 'rgba(15,20,45,0.95)', border: '1px solid rgba(136,146,176,0.15)', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                                labelStyle={{ color: '#e8edf5', fontWeight: 600 }}
                                itemStyle={{ color: '#4f8ff7' }}
                                formatter={(val, name) => [val, name === 'rating' ? 'Rating' : name]}
                            />
                            <Area type="monotone" dataKey="rating" stroke="#4f8ff7" strokeWidth={2.5} fill="url(#ratingGrad)" dot={false} activeDot={{ r: 5, fill: '#4f8ff7', stroke: '#050816', strokeWidth: 2 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '60px' }}>No rating history found</p>
                )}
            </div>

            {/* Verdict Distribution */}
            <div className="glass-card-static">
                <h2 className="section-title">📋 Verdict Distribution</h2>
                <div className="flex flex-wrap items-center" style={{ gap: '40px' }}>
                    <div style={{ flex: '0 0 260px' }}>
                        <ResponsiveContainer width={260} height={260}>
                            <PieChart>
                                <Pie data={verdicts} cx="50%" cy="50%" innerRadius={65} outerRadius={110} dataKey="value" paddingAngle={2} strokeWidth={0}>
                                    {verdicts.map((_, i) => (
                                        <Cell key={i} fill={VERDICT_COLORS[i % VERDICT_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'rgba(15,20,45,0.95)', border: '1px solid rgba(136,146,176,0.15)', borderRadius: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-3" style={{ flex: 1 }}>
                        {verdicts.slice(0, 8).map((v, i) => (
                            <div key={v.name} className="flex items-center gap-3" style={{ fontSize: '13px' }}>
                                <div style={{
                                    width: '10px', height: '10px', borderRadius: '3px',
                                    background: VERDICT_COLORS[i % VERDICT_COLORS.length], flexShrink: 0,
                                }} />
                                <span style={{ color: 'var(--color-text-secondary)', flex: 1 }}>{v.name}</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px' }}>{v.value}</span>
                                <div style={{
                                    width: '80px', height: '4px', borderRadius: '2px',
                                    background: 'rgba(136, 146, 176, 0.08)',
                                }}>
                                    <div style={{
                                        height: '100%', borderRadius: '2px',
                                        background: VERDICT_COLORS[i % VERDICT_COLORS.length],
                                        width: `${(v.value / verdicts[0].value) * 100}%`,
                                        transition: 'width 0.5s ease',
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
