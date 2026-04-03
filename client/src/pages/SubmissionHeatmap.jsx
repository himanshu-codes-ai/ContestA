import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import { fetchSubmissions } from '../services/api';
import { getHeatmapData, getHeatmapStats } from '../utils/dataProcessing';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export default function SubmissionHeatmap() {
    const { handle } = useParams();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [heatmapData, setHeatmapData] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const finalHandle = handle || profile?.cf_handle;
    useEffect(() => { if (finalHandle) loadData(); }, [finalHandle]);

    async function loadData() {
        setLoading(true); setError(null);
        try {
            const subs = await fetchSubmissions(finalHandle);
            const data = getHeatmapData(subs);
            setHeatmapData(data); setStats(getHeatmapStats(data));
        } catch (err) { setError(err.response?.data?.comment || err.message); }
        finally { setLoading(false); }
    }

    if (!finalHandle) {
        return (
            <div className="prompt-state page-enter">
                <div style={{ fontSize: '40px', marginBottom: '8px', animation: 'float 3s ease-in-out infinite', color: 'var(--color-accent-green)' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                </div>
                <h2>Activity Heatmap</h2>
                <p>Set your Codeforces handle in your profile to view your activity heatmap.</p>
                <div style={{ marginTop: 12 }}>
                    <button className="btn-primary" onClick={() => navigate('/profile')}>Go to Profile</button>
                </div>
            </div>
        );
    }

    if (loading) return <LoadingSpinner message={`Building heatmap for ${finalHandle}...`} />;
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
                <h1 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--color-text-bright)', letterSpacing: '-0.02em' }}>
                    Activity Heatmap
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px', fontFamily: 'var(--font-sans)' }}>
                    Daily submission activity for <span style={{ color: 'var(--color-accent-green)', fontWeight: 500 }}>{finalHandle}</span>
                </p>
            </div>

            {stats && (
                <div className="stat-grid" style={{ marginBottom: '20px' }}>
                    <div className="glass-card-static" style={{ padding: '18px' }}>
                        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>Longest Streak</p>
                        <p style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-code)', color: 'var(--color-accent-amber)', letterSpacing: '-0.02em' }}>{stats.longestStreak} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-muted)' }}>days</span></p>
                    </div>
                    <div className="glass-card-static" style={{ padding: '18px' }}>
                        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>Active Days</p>
                        <p style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-code)', color: 'var(--color-accent-green)', letterSpacing: '-0.02em' }}>{stats.totalActiveDays}</p>
                    </div>
                    <div className="glass-card-static" style={{ padding: '18px' }}>
                        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>Busiest Day</p>
                        <p style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-code)', color: 'var(--color-accent-cyan)', letterSpacing: '-0.02em' }}>{stats.busiestDay || '—'}</p>
                        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>{stats.maxCount} submissions</p>
                    </div>
                </div>
            )}

            <div className="glass-card-static">
                <div className="accent-line" style={{ background: 'var(--gradient-green)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 className="section-title" style={{ marginBottom: 0 }}>Last 12 Months</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>Less</span>
                        {['color-empty','color-scale-1','color-scale-2','color-scale-3','color-scale-4'].map((cls) => (
                            <svg key={cls} width="12" height="12"><rect width="12" height="12" className={cls} rx="2" /></svg>
                        ))}
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>More</span>
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
