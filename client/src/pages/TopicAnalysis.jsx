import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { fetchSubmissions } from '../services/api';
import { getTagDistribution, getRatingDistribution } from '../utils/dataProcessing';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

const TAG_COLORS = ['#22c55e','#16a34a','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#14b8a6','#f97316','#3b82f6','#84cc16','#e879f9','#e11d48','#0ea5e9','#d946ef'];

const ratingColor = (r) => {
    if (r >= 2400) return '#ef4444';
    if (r >= 2100) return '#f59e0b';
    if (r >= 1900) return '#8b5cf6';
    if (r >= 1600) return '#3b82f6';
    if (r >= 1400) return '#06b6d4';
    if (r >= 1200) return '#22c55e';
    return '#52525b';
};

export default function TopicAnalysis() {
    const { handle } = useParams();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const finalHandle = handle || profile?.cf_handle;
    useEffect(() => { if (finalHandle) loadData(); }, [finalHandle]);

    async function loadData() {
        setLoading(true); setError(null);
        try { setSubmissions(await fetchSubmissions(finalHandle)); }
        catch (err) { setError(err.response?.data?.comment || err.message); }
        finally { setLoading(false); }
    }

    if (!finalHandle) {
        return (
            <div className="prompt-state page-enter">
                <div style={{ fontSize: '40px', marginBottom: '8px', animation: 'float 3s ease-in-out infinite', color: 'var(--color-accent-green)' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
                </div>
                <h2>Topic Analysis</h2>
                <p>Set your Codeforces handle in your profile to view topic analysis.</p>
                <div style={{ marginTop: 12 }}>
                    <button className="btn-primary" onClick={() => navigate('/profile')}>Go to Profile</button>
                </div>
            </div>
        );
    }

    if (loading) return <LoadingSpinner message={`Analyzing ${finalHandle}'s topics...`} />;
    if (error) return <ErrorState message={error} onRetry={loadData} />;

    const tagData = getTagDistribution(submissions);
    const ratingData = getRatingDistribution(submissions);

    return (
        <div className="page-enter">
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--color-text-bright)', letterSpacing: '-0.02em' }}>
                        Topic Analysis
                    </h1>
                    <span className="status-tag">Live</span>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px', fontFamily: 'var(--font-sans)' }}>
                    Analyzing {submissions.length} submissions for <span style={{ color: 'var(--color-accent-green)', fontWeight: 500 }}>{finalHandle}</span>
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' }}>
                {/* Tag Distribution */}
                <div className="glass-card-static">
                    <div className="accent-line" style={{ background: 'var(--gradient-green)' }} />
                    <h2 className="section-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                        Tag Distribution
                    </h2>
                    {tagData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie data={tagData.slice(0, 12)} cx="50%" cy="50%" innerRadius={70} outerRadius={115} dataKey="value" paddingAngle={1} strokeWidth={0}>
                                        {tagData.slice(0, 12).map((_, i) => <Cell key={i} fill={TAG_COLORS[i % TAG_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--border-color-hover)', borderRadius: '6px', fontFamily: 'var(--font-sans)', fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
                                {tagData.slice(0, 12).map((t, i) => (
                                    <span key={t.name} style={{
                                        fontSize: '11px', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 500, fontFamily: 'var(--font-sans)',
                                        background: `${TAG_COLORS[i % TAG_COLORS.length]}10`, color: TAG_COLORS[i % TAG_COLORS.length], border: `1px solid ${TAG_COLORS[i % TAG_COLORS.length]}20`,
                                    }}>
                                        {t.name}: {t.value}
                                    </span>
                                ))}
                            </div>
                        </>
                    ) : <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '60px', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>No data available</p>}
                </div>

                {/* Rating Distribution */}
                <div className="glass-card-static">
                    <div className="accent-line" style={{ background: 'var(--gradient-amber)' }} />
                    <h2 className="section-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                        Difficulty Distribution
                    </h2>
                    {ratingData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={360}>
                            <BarChart data={ratingData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="rating" stroke="#52525b" tick={{ fontSize: 11, fontFamily: 'var(--font-sans)' }} />
                                <YAxis stroke="#52525b" tick={{ fontSize: 11, fontFamily: 'var(--font-sans)' }} />
                                <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--border-color-hover)', borderRadius: '6px', fontFamily: 'var(--font-sans)', fontSize: '12px' }} />
                                <Bar dataKey="count" name="Problems" radius={[4, 4, 0, 0]}>
                                    {ratingData.map((e, i) => <Cell key={i} fill={ratingColor(e.rating)} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '60px', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>No data available</p>}
                </div>
            </div>
        </div>
    );
}
