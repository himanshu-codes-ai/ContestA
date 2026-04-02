import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { fetchSubmissions } from '../services/api';
import { getTagDistribution, getRatingDistribution } from '../utils/dataProcessing';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

const TAG_COLORS = ['#00ff41','#00cc33','#ffb800','#ff3333','#bc8cff','#00d4ff','#ff6b6b','#14b8a6','#f97316','#58a6ff','#84cc16','#e879f9','#e11d48','#0ea5e9','#d946ef'];

const ratingColor = (r) => {
    if (r >= 2400) return '#ff3333';
    if (r >= 2100) return '#ffb800';
    if (r >= 1900) return '#bc8cff';
    if (r >= 1600) return '#58a6ff';
    if (r >= 1400) return '#03a89e';
    if (r >= 1200) return '#00ff41';
    return '#484f58';
};

export default function TopicAnalysis() {
    const { handle } = useParams();
    const navigate = useNavigate();
    const [inputHandle, setInputHandle] = useState('');
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => { if (handle) loadData(); }, [handle]);

    async function loadData() {
        setLoading(true); setError(null);
        try { setSubmissions(await fetchSubmissions(handle)); }
        catch (err) { setError(err.response?.data?.comment || err.message); }
        finally { setLoading(false); }
    }

    if (!handle) {
        return (
            <div className="prompt-state page-enter">
                <div style={{ fontSize: '40px', marginBottom: '8px', animation: 'float 3s ease-in-out infinite', color: 'var(--color-accent-green)' }}>◉</div>
                <h2>Topic Analysis</h2>
                <p>Discover your tag strengths and identify rating gaps</p>
                <form onSubmit={(e) => { e.preventDefault(); if (inputHandle.trim()) navigate(`/topics/${inputHandle.trim()}`); }} style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '400px' }}>
                    <input value={inputHandle} onChange={(e) => setInputHandle(e.target.value)} placeholder="Codeforces handle..." className="input-field" />
                    <button type="submit" className="btn-primary">Analyze →</button>
                </form>
            </div>
        );
    }

    if (loading) return <LoadingSpinner message={`Analyzing ${handle}'s topics...`} />;
    if (error) return <ErrorState message={error} onRetry={loadData} />;

    const tagData = getTagDistribution(submissions);
    const ratingData = getRatingDistribution(submissions);

    return (
        <div className="page-enter">
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-text-bright)' }}>
                        Topic Analysis
                    </h1>
                    <span className="status-tag">Live</span>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                    Analyzing {submissions.length} submissions for <span style={{ color: 'var(--color-accent-green)' }}>{handle}</span>
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                {/* Tag Distribution */}
                <div className="glass-card-static">
                    <div className="accent-line" style={{ background: 'var(--gradient-green)' }} />
                    <h2 className="section-title">■ Tag Distribution</h2>
                    {tagData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie data={tagData.slice(0, 12)} cx="50%" cy="50%" innerRadius={70} outerRadius={115} dataKey="value" paddingAngle={1} strokeWidth={0}>
                                        {tagData.slice(0, 12).map((_, i) => <Cell key={i} fill={TAG_COLORS[i % TAG_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'rgba(13,17,23,0.97)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: '2px', fontFamily: 'Share Tech Mono', fontSize: '11px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '14px' }}>
                                {tagData.slice(0, 12).map((t, i) => (
                                    <span key={t.name} style={{
                                        fontSize: '10px', padding: '3px 8px', borderRadius: '2px', fontWeight: 500, fontFamily: 'var(--font-mono)',
                                        background: `${TAG_COLORS[i % TAG_COLORS.length]}10`, color: TAG_COLORS[i % TAG_COLORS.length], border: `1px solid ${TAG_COLORS[i % TAG_COLORS.length]}20`,
                                    }}>
                                        {t.name}: {t.value}
                                    </span>
                                ))}
                            </div>
                        </>
                    ) : <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '60px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>No data available</p>}
                </div>

                {/* Rating Distribution */}
                <div className="glass-card-static">
                    <div className="accent-line" style={{ background: 'var(--gradient-amber)' }} />
                    <h2 className="section-title">■ Difficulty Distribution</h2>
                    {ratingData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={360}>
                            <BarChart data={ratingData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,65,0.06)" />
                                <XAxis dataKey="rating" stroke="#484f58" tick={{ fontSize: 10, fontFamily: 'Share Tech Mono' }} />
                                <YAxis stroke="#484f58" tick={{ fontSize: 10, fontFamily: 'Share Tech Mono' }} />
                                <Tooltip contentStyle={{ background: 'rgba(13,17,23,0.97)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: '2px', fontFamily: 'Share Tech Mono', fontSize: '11px' }} />
                                <Bar dataKey="count" name="Problems" radius={[2, 2, 0, 0]}>
                                    {ratingData.map((e, i) => <Cell key={i} fill={ratingColor(e.rating)} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '60px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>No data available</p>}
                </div>
            </div>
        </div>
    );
}
