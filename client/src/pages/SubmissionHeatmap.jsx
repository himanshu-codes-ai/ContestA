import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import { fetchSubmissions } from '../services/api';
import { getHeatmapData, getHeatmapStats } from '../utils/dataProcessing';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export default function SubmissionHeatmap() {
    const { handle } = useParams();
    const navigate = useNavigate();
    const [inputHandle, setInputHandle] = useState('');
    const [heatmapData, setHeatmapData] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (handle) loadData();
    }, [handle]);

    async function loadData() {
        setLoading(true);
        setError(null);
        try {
            const subs = await fetchSubmissions(handle);
            const data = getHeatmapData(subs);
            setHeatmapData(data);
            setStats(getHeatmapStats(data));
        } catch (err) {
            setError(err.response?.data?.comment || err.message);
        } finally {
            setLoading(false);
        }
    }

    if (!handle) {
        return (
            <div className="page-enter" style={{ textAlign: 'center', paddingTop: '100px' }}>
                <h2 className="text-2xl font-bold mb-2">🔥 Submission Heatmap</h2>
                <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>See your daily coding activity on Codeforces</p>
                <form onSubmit={(e) => { e.preventDefault(); if (inputHandle.trim()) navigate(`/heatmap/${inputHandle.trim()}`); }} style={{ display: 'flex', gap: '12px', maxWidth: '400px', margin: '0 auto' }}>
                    <input value={inputHandle} onChange={(e) => setInputHandle(e.target.value)} placeholder="Codeforces handle..." className="input-field" />
                    <button type="submit" className="btn-primary">View</button>
                </form>
            </div>
        );
    }

    if (loading) return <LoadingSpinner message={`Building heatmap for ${handle}...`} />;
    if (error) return <ErrorState message={error} onRetry={loadData} />;

    const today = new Date();
    const startDate = new Date(today);
    startDate.setFullYear(startDate.getFullYear() - 1);

    const maxCount = Math.max(...heatmapData.map((d) => d.count), 1);

    function classForValue(value) {
        if (!value || value.count === 0) return 'color-empty';
        const ratio = value.count / maxCount;
        if (ratio <= 0.25) return 'color-scale-1';
        if (ratio <= 0.5) return 'color-scale-2';
        if (ratio <= 0.75) return 'color-scale-3';
        return 'color-scale-4';
    }

    return (
        <div className="page-enter">
            <h1 className="text-2xl font-bold mb-6">
                🔥 Submission Heatmap —{' '}
                <span className="gradient-text">{handle}</span>
            </h1>

            {stats && (
                <div className="stat-grid" style={{ marginBottom: '24px' }}>
                    <StatCard icon="🔥" label="Longest Streak" value={`${stats.longestStreak} days`} color="var(--gradient-warm)" />
                    <StatCard icon="📅" label="Active Days" value={stats.totalActiveDays} color="var(--gradient-success)" />
                    <StatCard icon="⚡" label="Busiest Day" value={stats.busiestDay || '—'} subtitle={`${stats.maxCount} submissions`} color="var(--gradient-primary)" />
                </div>
            )}

            <div className="glass-card">
                <h2 className="section-title">Last 12 Months</h2>
                <div style={{ overflowX: 'auto', padding: '10px 0' }}>
                    <CalendarHeatmap
                        startDate={startDate}
                        endDate={today}
                        values={heatmapData}
                        classForValue={classForValue}
                        tooltipDataAttrs={(value) => {
                            if (!value || !value.date) return {};
                            return {
                                'data-tooltip-id': 'heatmap-tooltip',
                                'data-tooltip-content': `${value.date}: ${value.count} submission${value.count !== 1 ? 's' : ''}`,
                            };
                        }}
                        showWeekdayLabels
                    />
                    <Tooltip id="heatmap-tooltip" />
                </div>
                <div className="flex items-center gap-2 mt-4" style={{ justifyContent: 'flex-end' }}>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Less</span>
                    {['color-empty', 'color-scale-1', 'color-scale-2', 'color-scale-3', 'color-scale-4'].map((cls) => (
                        <div
                            key={cls}
                            style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '3px',
                            }}
                            className={`react-calendar-heatmap ${cls}`}
                        >
                            <svg width="14" height="14"><rect width="14" height="14" className={cls} rx="2" /></svg>
                        </div>
                    ))}
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>More</span>
                </div>
            </div>
        </div>
    );
}
