import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import { fetchUser, fetchRating, fetchSubmissions } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getOverallStats, getVerdictDistribution, getRankInfo, formatDate } from '../utils/dataProcessing';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

const VERDICT_COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#f87171', '#52525b', '#3b82f6'];

export default function UserDashboard() {
    const { handle } = useParams();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [user, setUser] = useState(null);
    const [ratingHistory, setRatingHistory] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const finalHandle = handle || profile?.cf_handle;
    useEffect(() => { if (finalHandle) loadData(); }, [finalHandle]);

    async function loadData() {
        setLoading(true); setError(null);
        try {
            const [u, r, s] = await Promise.all([fetchUser(finalHandle), fetchRating(finalHandle), fetchSubmissions(finalHandle)]);
            setUser(u); setRatingHistory(r); setSubmissions(s);
        } catch (err) { setError(err.response?.data?.comment || err.message || 'Failed to fetch data'); }
        finally { setLoading(false); }
    }

    if (!finalHandle) {
        return (
            <div className="prompt-state page-enter">
                <div style={{ fontSize: '40px', marginBottom: '8px', animation: 'float 3s ease-in-out infinite', color: 'var(--color-accent-green)' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                </div>
                <h2>User Dashboard</h2>
                <p>Your Codeforces handle is not set. Please add it to your profile to view analytics.</p>
                <div style={{ marginTop: 12 }}>
                    <button className="btn-primary" onClick={() => navigate('/profile')}>Go to Profile</button>
                </div>
            </div>
        );
    }

    if (loading) return <LoadingSpinner message={`Loading ${finalHandle}'s profile...`} />;
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
            <div className="glass-card-static" style={{ marginBottom: '20px', padding: '24px' }}>
                <div className="accent-line" style={{ background: `linear-gradient(90deg, ${rankInfo.color}, transparent)` }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
                    <img
                        src={user?.titlePhoto || 'https://userpic.codeforces.org/no-title.jpg'}
                        alt={handle}
                        style={{ width: '64px', height: '64px', borderRadius: '50%', border: `2px solid ${rankInfo.color}`, objectFit: 'cover', boxShadow: `0 0 15px ${rankInfo.color}20` }}
                        onError={(e) => { e.target.src = 'https://userpic.codeforces.org/no-title.jpg'; }}
                    />
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em' }}>
                            <span className={rankInfo.className}>{finalHandle}</span>
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                            <span className="status-tag" style={{ background: `${rankInfo.color}12`, color: rankInfo.color, borderColor: `${rankInfo.color}20` }}>
                                {rankInfo.rank}
                            </span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px', fontFamily: 'var(--font-sans)' }}>
                            {user?.organization || 'No organization'} {user?.country ? `· ${user.country}` : ''}
                        </p>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                                <Link to={`/topics/${finalHandle}`} className="btn-ghost">Topics</Link>
                                <Link to={`/heatmap/${finalHandle}`} className="btn-ghost">Heatmap</Link>
                                <Link to={`/upsolving/${finalHandle}`} className="btn-ghost">Upsolve</Link>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'var(--font-code)', color: rankInfo.color, lineHeight: 1, letterSpacing: '-0.03em' }}>
                            {user?.rating || '—'}
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px', fontFamily: 'var(--font-sans)' }}>
                            {rankInfo.rank}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', fontFamily: 'var(--font-sans)' }}>
                            Max: <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{user?.maxRating || '—'}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stat-grid" style={{ marginBottom: '20px' }}>
                <div className="glass-card-static" style={{ padding: '18px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>Problems Solved</p>
                    <p style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-code)', color: 'var(--color-accent-green)', letterSpacing: '-0.02em' }}>{stats.totalSolved}</p>
                </div>
                <div className="glass-card-static" style={{ padding: '18px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>Total Submissions</p>
                    <p style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-code)', color: 'var(--color-accent-cyan)', letterSpacing: '-0.02em' }}>{stats.totalAttempts}</p>
                </div>
                <div className="glass-card-static" style={{ padding: '18px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>Accept Rate</p>
                    <p style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-code)', color: 'var(--color-accent-amber)', letterSpacing: '-0.02em' }}>{stats.acceptRate}%</p>
                </div>
                <div className="glass-card-static" style={{ padding: '18px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>Current Rating</p>
                    <p style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-code)', color: rankInfo.color, letterSpacing: '-0.02em' }}>{user?.rating || '—'}</p>
                    {lastChange !== 0 && <p style={{ fontSize: '12px', color: lastChange >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)', marginTop: '2px' }}>{lastChange >= 0 ? '+' : ''}{lastChange}</p>}
                </div>
                <div className="glass-card-static" style={{ padding: '18px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>Max Rating</p>
                    <p style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-code)', color: 'var(--color-accent-amber)', letterSpacing: '-0.02em' }}>{user?.maxRating || '—'}</p>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{user?.maxRank}</p>
                </div>
                <div className="glass-card-static" style={{ padding: '18px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>Contests</p>
                    <p style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-code)', color: 'var(--color-accent-blue)', letterSpacing: '-0.02em' }}>{ratingHistory.length}</p>
                </div>
            </div>

            {/* Rating Chart */}
            <div className="glass-card-static" style={{ marginBottom: '20px' }}>
                <h2 className="section-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-green)" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                    Rating History
                </h2>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                            <XAxis dataKey="date" stroke="#52525b" tick={{ fontSize: 11, fontFamily: 'var(--font-sans)' }} interval="preserveStartEnd" />
                            <YAxis stroke="#52525b" tick={{ fontSize: 11, fontFamily: 'var(--font-sans)' }} domain={['dataMin - 100', 'dataMax + 100']} />
                            <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--border-color-hover)', borderRadius: '6px', fontFamily: 'var(--font-sans)', fontSize: '12px' }}
                                labelStyle={{ color: 'var(--color-accent-green)', fontWeight: 600 }} itemStyle={{ color: 'var(--color-accent-green)' }}
                                formatter={(val) => [val, 'Rating']}
                            />
                            <Area type="monotone" dataKey="rating" stroke="#22c55e" strokeWidth={2} fill="url(#ratingGrad)" dot={false} activeDot={{ r: 4, fill: '#22c55e', stroke: 'var(--color-bg-primary)', strokeWidth: 2 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '60px', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>No rating history found</p>
                )}
            </div>

            {/* Verdict Distribution */}
            <div className="glass-card-static">
                <h2 className="section-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                    Verdict Distribution
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '32px' }}>
                    <div style={{ flex: '0 0 240px' }}>
                        <ResponsiveContainer width={240} height={240}>
                            <PieChart>
                                <Pie data={verdicts} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={2} strokeWidth={0}>
                                    {verdicts.map((_, i) => <Cell key={i} fill={VERDICT_COLORS[i % VERDICT_COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--border-color-hover)', borderRadius: '6px', fontFamily: 'var(--font-sans)', fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {verdicts.slice(0, 8).map((v, i) => (
                            <div key={v.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: VERDICT_COLORS[i % VERDICT_COLORS.length], flexShrink: 0 }} />
                                <span style={{ color: 'var(--color-text-secondary)', flex: 1, fontFamily: 'var(--font-sans)', fontSize: '12px' }}>{v.name}</span>
                                <span style={{ fontFamily: 'var(--font-code)', fontWeight: 600, fontSize: '12px', color: 'var(--color-text-bright)' }}>{v.value}</span>
                                <div style={{ width: '60px', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)' }}>
                                    <div style={{ height: '100%', borderRadius: '2px', background: VERDICT_COLORS[i % VERDICT_COLORS.length], width: `${(v.value / verdicts[0].value) * 100}%`, transition: 'width 0.5s ease' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
