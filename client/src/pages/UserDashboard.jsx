import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import { fetchUser, fetchRating, fetchSubmissions, fetchDailyProblem, fetchDailyProblemHistory } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getOverallStats, getVerdictDistribution, getRankInfo, formatDate } from '../utils/dataProcessing';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import DailyProblemWidget from '../components/DailyProblemWidget';

const VERDICT_COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#f87171', '#52525b', '#3b82f6'];

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

export default function UserDashboard() {
    const { handle } = useParams();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [user, setUser] = useState(null);
    const [ratingHistory, setRatingHistory] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [dailyProblem, setDailyProblem] = useState(null);
    const [dailyHistory, setDailyHistory] = useState(null);
    const [dailyLoading, setDailyLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');

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

    useEffect(() => {
        if (finalHandle) {
            loadDaily();
        }
    }, [finalHandle]);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
            const diffMs = tomorrow - now;
            const h = Math.floor((diffMs / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
            const m = Math.floor((diffMs / 1000 / 60) % 60).toString().padStart(2, '0');
            const s = Math.floor((diffMs / 1000) % 60).toString().padStart(2, '0');
            setTimeLeft(`${h}:${m}:${s}`);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    async function loadDaily() {
        setDailyLoading(true);
        try {
            const [dp, dh] = await Promise.all([
                fetchDailyProblem(finalHandle),
                fetchDailyProblemHistory(finalHandle),
            ]);
            setDailyProblem(dp);
            setDailyHistory(dh);
        } catch (err) {
            console.error("Failed to load daily problem", err);
        } finally {
            setDailyLoading(false);
        }
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

    const solvedCount = dailyHistory ? dailyHistory.filter(h => h.isSolved).length : 0;
    const streak = (() => {
        if (!dailyHistory) return 0;
        let s = 0;
        for (const h of dailyHistory) {
            if (h.isSolved) s++;
            else break;
        }
        return s;
    })();

    return (
        <div className="page-enter">
            {/* Profile Header */}
            <div className="glass-card-static" style={{ marginBottom: '20px', padding: '24px' }}>
                <div className="accent-line" style={{ background: `linear-gradient(90deg, ${rankInfo.color}, transparent)` }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
                    <img
                        src={user?.titlePhoto || 'https://userpic.codeforces.org/no-title.jpg'}
                        alt={finalHandle}
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

            {/* Daily Challenge Section (LeetCode-style integrated) */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-cyan)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--color-text-bright)', letterSpacing: '-0.01em' }}>Daily Challenge</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '9px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1px' }}>Solved</p>
                                <p style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-code)', color: 'var(--color-accent-green)' }}>{solvedCount}</p>
                            </div>
                            <div style={{ width: '1px', height: '28px', background: 'var(--border-color)' }} />
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '9px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1px' }}>Streak</p>
                                <p style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-code)', color: 'var(--color-accent-amber)' }}>{streak}🔥</p>
                            </div>
                        </div>
                        <div className="glass-card-static" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-cyan)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Next in:</span>
                            <span style={{ fontFamily: 'var(--font-code)', fontWeight: 800, fontSize: '14px', color: 'var(--color-accent-cyan)', textShadow: '0 0 8px rgba(0, 212, 255, 0.3)' }}>
                                {timeLeft || '00:00:00'}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
                    {/* Problem Card */}
                    <div className="glass-card-static" style={{ padding: '0', position: 'relative', overflow: 'hidden' }}>
                        <div className="accent-line" style={{ background: dailyProblem?.isSolvedToday ? 'var(--gradient-green)' : 'var(--gradient-cyan)', height: '2px' }} />

                        {dailyLoading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                                <div className="loader" style={{ width: '24px', height: '24px', margin: '0 auto 12px' }}></div>
                                Loading today's problem...
                            </div>
                        ) : dailyProblem ? (
                            <div style={{ padding: '24px 28px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '6px',
                                                background: dailyProblem.isSolvedToday ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0, 212, 255, 0.1)',
                                                color: dailyProblem.isSolvedToday ? 'var(--color-accent-green)' : 'var(--color-accent-cyan)',
                                                border: `1px solid ${dailyProblem.isSolvedToday ? 'rgba(34, 197, 94, 0.2)' : 'rgba(0, 212, 255, 0.2)'}`,
                                                fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.03em',
                                            }}>
                                                {dailyProblem.isSolvedToday ? '✓ SOLVED TODAY' : "TODAY'S PROBLEM"}
                                            </span>
                                            <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500 }}>
                                                {dailyProblem.problem.contestId}{dailyProblem.problem.index}
                                            </span>
                                        </div>

                                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-bright)', marginBottom: '14px', lineHeight: 1.3, letterSpacing: '-0.02em' }}>
                                            {dailyProblem.problem.name}
                                        </h3>

                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
                                            {dailyProblem.problem.rating && (
                                                <span style={{
                                                    background: `${ratingColor(dailyProblem.problem.rating)}12`, color: ratingColor(dailyProblem.problem.rating),
                                                    padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700,
                                                    border: `1px solid ${ratingColor(dailyProblem.problem.rating)}25`,
                                                }}>
                                                    Rating: {dailyProblem.problem.rating}
                                                </span>
                                            )}
                                            {dailyProblem.problem.tags.map(t => (
                                                <span key={t} className="tag-chip">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {dailyProblem.problem.solvedCount && (
                                    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', padding: '10px 14px', background: 'var(--color-bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color-dim)' }}>
                                        <div>
                                            <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Solved by</p>
                                            <p style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-code)', color: 'var(--color-text-bright)' }}>{dailyProblem.problem.solvedCount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <button
                                        className="btn-primary-filled"
                                        style={{ padding: '12px 24px', fontSize: '13px', fontWeight: 700 }}
                                        onClick={() => window.open(`https://codeforces.com/problemset/problem/${dailyProblem.problem.contestId}/${dailyProblem.problem.index}`, '_blank')}
                                    >
                                        {dailyProblem.isSolvedToday ? 'Review Problem' : 'Solve Now on Codeforces'}
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                    </button>

                                    {!dailyProblem.isSolvedToday && (
                                        <button
                                            className="btn-secondary"
                                            style={{ padding: '12px 18px' }}
                                            onClick={() => { loadDaily(); }}
                                        >
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
                                            Refresh Status
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                                Unable to load daily problem.
                            </div>
                        )}
                    </div>

                    {/* Calendar Widget */}
                    <div>
                        {dailyLoading && !dailyHistory ? (
                            <div className="glass-card-static" style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="loader" style={{ width: '20px', height: '20px' }}></div>
                            </div>
                        ) : (
                            <DailyProblemWidget history={dailyHistory || []} />
                        )}
                    </div>
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
