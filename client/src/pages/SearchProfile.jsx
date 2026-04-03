import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { fetchUser, fetchRating, fetchSubmissions } from '../services/api';
import { getOverallStats, getRankInfo, formatDate, getHeatmapData, getHeatmapStats } from '../utils/dataProcessing';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export default function SearchProfile() {
    const [searchHandle, setSearchHandle] = useState('');
    const [currentHandle, setCurrentHandle] = useState('');
    const [userData, setUserData] = useState(null);
    const [ratingHistory, setRatingHistory] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);
    const [heatmapStats, setHeatmapStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchHandle.trim()) {
            setError('Please enter a Codeforces handle');
            return;
        }

        setLoading(true);
        setError(null);
        setCurrentHandle(searchHandle.trim());
        setUserData(null);
        setRatingHistory([]);
        setSubmissions([]);

        try {
            const [user, rating, subs] = await Promise.all([
                fetchUser(searchHandle.trim()),
                fetchRating(searchHandle.trim()),
                fetchSubmissions(searchHandle.trim()),
            ]);

            setUserData(user);
            setRatingHistory(rating);
            setSubmissions(subs);

            const hmData = getHeatmapData(subs);
            setHeatmapData(hmData);
            setHeatmapStats(getHeatmapStats(hmData));
        } catch (err) {
            const errMsg = err.response?.data?.comment || err.message || 'User not found';
            setError(errMsg);
            setUserData(null);
        } finally {
            setLoading(false);
        }
    };

    const today = new Date();
    const yearAgo = new Date(today);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    const maxCount = Math.max(...heatmapData.map((d) => d.count), 1);

    function classForValue(value) {
        if (!value || value.count === 0) return 'color-empty';
        const ratio = value.count / maxCount;
        if (ratio <= 0.25) return 'color-scale-1';
        if (ratio <= 0.5) return 'color-scale-2';
        if (ratio <= 0.75) return 'color-scale-3';
        return 'color-scale-4';
    }

    const stats = userData ? getOverallStats(submissions) : null;
    const rankInfo = userData ? getRankInfo(userData.rating) : null;

    return (
        <div className="page-enter">
            {/* Search Section */}
            <div className="glass-card-static" style={{ marginBottom: '24px', padding: '24px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-text-bright)', marginBottom: '16px' }}>
                    🔎 Find a Profile
                </h1>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        value={searchHandle}
                        onChange={(e) => setSearchHandle(e.target.value)}
                        placeholder="Enter Codeforces handle..."
                        style={{
                            flex: 1, padding: '12px 14px', borderRadius: '2px',
                            background: 'var(--color-bg-card)', border: '1px solid var(--border-color-dim)',
                            color: 'var(--color-text-bright)', fontFamily: 'var(--font-mono)', fontSize: '13px',
                        }}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary-filled"
                        style={{
                            padding: '12px 24px', fontSize: '13px', whiteSpace: 'nowrap',
                            opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? '⏳' : '🔍'} Search
                    </button>
                </form>
            </div>

            {/* Error State */}
            {error && !userData && <ErrorState message={error} onRetry={() => setError(null)} />}

            {/* Loading State */}
            {loading && <LoadingSpinner message={currentHandle ? `Loading ${currentHandle}...` : 'Searching...'} />}

            {/* Results */}
            {userData && (
                <>
                    {/* Profile Header */}
                    <div className="glass-card-static" style={{ marginBottom: '20px', padding: '28px' }}>
                        <div className="accent-line" style={{ background: `linear-gradient(90deg, ${rankInfo.color}, transparent)` }} />
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
                            <img
                                src={userData?.titlePhoto || 'https://userpic.codeforces.org/no-title.jpg'}
                                alt={currentHandle}
                                style={{ width: '72px', height: '72px', borderRadius: '2px', border: `2px solid ${rankInfo.color}`, objectFit: 'cover', boxShadow: `0 0 15px ${rankInfo.color}33` }}
                                onError={(e) => { e.target.src = 'https://userpic.codeforces.org/no-title.jpg'; }}
                            />
                            <div style={{ flex: 1 }}>
                                <h1 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-text-bright)' }}>
                                    {currentHandle}
                                </h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    <span className="status-tag" style={{ background: `${rankInfo.color}15`, color: rankInfo.color, borderColor: `${rankInfo.color}30` }}>
                                        {rankInfo.rank}
                                    </span>
                                </div>
                                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                                    {userData?.organization || 'No organization'} {userData?.country ? `· ${userData.country}` : ''}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'var(--font-code)', color: rankInfo.color, lineHeight: 1, textShadow: `0 0 20px ${rankInfo.color}40` }}>
                                    {userData?.rating || '—'}
                                </p>
                                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                                    {rankInfo.rank}
                                </p>
                                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                                    Max: <span style={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>{userData?.maxRating || '—'}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    {stats && (
                        <div className="stat-grid" style={{ marginBottom: '20px' }}>
                            <StatCard icon="✅" label="Solved" value={stats.totalSolved} color="var(--gradient-green)" />
                            <StatCard icon="📤" label="Submissions" value={stats.totalAttempts} color="var(--gradient-cyan)" />
                            <StatCard icon="🎯" label="Accept Rate" value={`${stats.acceptRate}%`} color="var(--gradient-amber)" />
                            <StatCard icon="🎮" label="Contests" value={ratingHistory.length} color="var(--gradient-cyan)" />
                        </div>
                    )}

                    {/* Recent Contests */}
                    {ratingHistory.length > 0 && (
                        <div className="glass-card-static" style={{ marginBottom: '20px' }}>
                            <h2 className="section-title">🎮 Recent Contests (Last 5)</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {ratingHistory.slice(-5).reverse().map((r, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '12px 14px', borderRadius: '2px',
                                        background: 'rgba(0, 255, 65, 0.02)', border: '1px solid rgba(0, 255, 65, 0.08)',
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-bright)', fontFamily: 'var(--font-mono)' }}>
                                                {r.contestName?.substring(0, 40) || 'Contest'}
                                            </p>
                                            <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                                                {formatDate(r.ratingUpdateTimeSeconds)}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-bright)', fontFamily: 'var(--font-code)' }}>
                                                {r.newRating}
                                            </p>
                                            <p style={{
                                                fontSize: '11px', fontFamily: 'var(--font-code)', fontWeight: 600,
                                                color: r.newRating - r.oldRating >= 0 ? 'var(--color-accent-green)' : '#ff3333',
                                            }}>
                                                {r.newRating - r.oldRating >= 0 ? '+' : ''}{r.newRating - r.oldRating}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Heatmap */}
                    {heatmapData.length > 0 && (
                        <div className="glass-card-static" style={{ marginBottom: '20px' }}>
                            <h2 className="section-title">▣ Activity Heatmap</h2>
                            {heatmapStats && (
                                <div className="stat-grid" style={{ marginBottom: '20px' }}>
                                    <StatCard icon="🔥" label="Longest Streak" value={`${heatmapStats.longestStreak} days`} color="var(--gradient-amber)" />
                                    <StatCard icon="📅" label="Active Days" value={heatmapStats.totalActiveDays} color="var(--gradient-green)" />
                                </div>
                            )}
                            <div style={{ overflowX: 'auto', padding: '8px 0' }}>
                                <CalendarHeatmap startDate={yearAgo} endDate={today} values={heatmapData} classForValue={classForValue}
                                    tooltipDataAttrs={(v) => {
                                        if (!v || !v.date) return {};
                                        return { 'data-tooltip-id': 'search-heatmap', 'data-tooltip-content': `${v.date}: ${v.count} submissions` };
                                    }}
                                    showWeekdayLabels
                                />
                                <ReactTooltip id="search-heatmap" />
                            </div>
                        </div>
                    )}

                    {/* Rating History Chart */}
                    {ratingHistory.length > 0 && (
                        <div className="glass-card-static">
                            <h2 className="section-title">📈 Rating History</h2>
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={ratingHistory.map((r) => ({
                                    name: r.contestName?.substring(0, 15) || '',
                                    date: formatDate(r.ratingUpdateTimeSeconds),
                                    rating: r.newRating,
                                }))} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="ratingGrad2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00ff41" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#00ff41" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 65, 0.06)" />
                                    <XAxis dataKey="date" stroke="#484f58" tick={{ fontSize: 10, fontFamily: 'Share Tech Mono' }} interval="preserveStartEnd" />
                                    <YAxis stroke="#484f58" tick={{ fontSize: 10, fontFamily: 'Share Tech Mono' }} />
                                    <Tooltip contentStyle={{ background: 'rgba(13,17,23,0.97)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: '2px', fontFamily: 'Share Tech Mono', fontSize: '11px' }} />
                                    <Area type="monotone" dataKey="rating" stroke="#00ff41" strokeWidth={2} fill="url(#ratingGrad2)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
