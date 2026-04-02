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

    useEffect(() => { if (handle) loadData(); }, [handle]);

    async function loadData() {
        setLoading(true); setError(null);
        try {
            const subs = await fetchSubmissions(handle);
            const data = getHeatmapData(subs);
            setHeatmapData(data); setStats(getHeatmapStats(data));
        } catch (err) { setError(err.response?.data?.comment || err.message); }
        finally { setLoading(false); }
    }

    if (!handle) {
        return (
            <div className="prompt-state page-enter">
                <div style={{ fontSize: '40px', marginBottom: '8px', animation: 'float 3s ease-in-out infinite', color: 'var(--color-accent-green)' }}>▣</div>
                <h2>Activity Heatmap</h2>
                <p>Visualize your daily coding activity on Codeforces</p>
                <form onSubmit={(e) => { e.preventDefault(); if (inputHandle.trim()) navigate(`/heatmap/${inputHandle.trim()}`); }} style={{ display: 'flex', gap: '10px', maxWidth: '400px', margin: '0 auto', width: '100%' }}>
                    <input value={inputHandle} onChange={(e) => setInputHandle(e.target.value)} placeholder="Codeforces handle..." className="input-field" />
                    <button type="submit" className="btn-primary">Render</button>
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
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-text-bright)' }}>
                    Activity Heatmap
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                    Daily submission activity for <span style={{ color: 'var(--color-accent-green)' }}>{handle}</span>
                </p>
            </div>

            {stats && (
                <div className="stat-grid" style={{ marginBottom: '20px' }}>
                    <StatCard icon="🔥" label="Longest Streak" value={`${stats.longestStreak} days`} color="var(--gradient-amber)" />
                    <StatCard icon="📅" label="Active Days" value={stats.totalActiveDays} color="var(--gradient-green)" />
                    <StatCard icon="⚡" label="Busiest Day" value={stats.busiestDay || '—'} subtitle={`${stats.maxCount} submissions`} color="var(--gradient-cyan)" />
                </div>
            )}

            <div className="glass-card-static">
                <div className="accent-line" style={{ background: 'var(--gradient-green)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 className="section-title" style={{ marginBottom: 0 }}>■ Last 12 Months</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>Less</span>
                        {['color-empty','color-scale-1','color-scale-2','color-scale-3','color-scale-4'].map((cls) => (
                            <svg key={cls} width="12" height="12"><rect width="12" height="12" className={cls} rx="1" /></svg>
                        ))}
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>More</span>
                    </div>
                </div>
                <div style={{ overflowX: 'auto', padding: '8px 0' }}>
                    <CalendarHeatmap startDate={startDate} endDate={today} values={heatmapData} classForValue={classForValue}
                        tooltipDataAttrs={(v) => {
                            if (!v || !v.date) return {};
                            return { 'data-tooltip-id': 'heatmap-tooltip', 'data-tooltip-content': `${v.date}: ${v.count} submission${v.count !== 1 ? 's' : ''}` };
                        }}
                        showWeekdayLabels
                    />
                    <Tooltip id="heatmap-tooltip" />
                </div>
            </div>
        </div>
    );
}
