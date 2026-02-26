import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { fetchSubmissions } from '../services/api';
import { getTagDistribution, getRatingDistribution, getOverallStats } from '../utils/dataProcessing';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

const TAG_COLORS = [
    '#4f8ff7', '#00e68c', '#ff9f43', '#ff4757', '#a855f7',
    '#00d4ff', '#f368e0', '#14b8a6', '#f97316', '#6c5ce7',
    '#84cc16', '#e879f9', '#e11d48', '#0ea5e9', '#d946ef',
];

const ratingColor = (r) => {
    if (r >= 2400) return '#ff4757';
    if (r >= 2100) return '#ffb74d';
    if (r >= 1900) return '#c060f0';
    if (r >= 1600) return '#4f8ff7';
    if (r >= 1400) return '#03a89e';
    if (r >= 1200) return '#00c853';
    return '#808080';
};

export default function TopicAnalysis() {
    const { handle } = useParams();
    const navigate = useNavigate();
    const [inputHandle, setInputHandle] = useState('');
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (handle) loadData();
    }, [handle]);

    async function loadData() {
        setLoading(true);
        setError(null);
        try {
            const s = await fetchSubmissions(handle);
            setSubmissions(s);
        } catch (err) {
            setError(err.response?.data?.comment || err.message);
        } finally {
            setLoading(false);
        }
    }

    if (!handle) {
        return (
            <div className="prompt-state page-enter">
                <div style={{ fontSize: '48px', marginBottom: '8px', animation: 'float 3s ease-in-out infinite' }}>◉</div>
                <h2>Topic & Difficulty Analysis</h2>
                <p>Discover your tag strengths and identify rating gaps</p>
                <form onSubmit={(e) => { e.preventDefault(); if (inputHandle.trim()) navigate(`/topics/${inputHandle.trim()}`); }} style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '400px' }}>
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
    const totalTagged = tagData.reduce((s, t) => s + t.value, 0);

    return (
        <div className="page-enter">
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    Topic Analysis — <span className="gradient-text">{handle}</span>
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '4px' }}>
                    Tag distribution and problem difficulty breakdown
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
                {/* Tag Distribution */}
                <div className="glass-card-static">
                    <div className="accent-line" style={{ background: 'var(--gradient-success)' }} />
                    <h2 className="section-title">🏷️ Tags Solved</h2>
                    {tagData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={tagData.slice(0, 12)}
                                        cx="50%" cy="50%"
                                        innerRadius={75} outerRadius={125}
                                        dataKey="value" paddingAngle={1} strokeWidth={0}
                                    >
                                        {tagData.slice(0, 12).map((_, i) => (
                                            <Cell key={i} fill={TAG_COLORS[i % TAG_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'rgba(15,20,45,0.95)', border: '1px solid rgba(136,146,176,0.15)', borderRadius: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '16px' }}>
                                {tagData.slice(0, 12).map((t, i) => (
                                    <span key={t.name} style={{
                                        fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: 500,
                                        background: `${TAG_COLORS[i % TAG_COLORS.length]}15`,
                                        color: TAG_COLORS[i % TAG_COLORS.length],
                                        border: `1px solid ${TAG_COLORS[i % TAG_COLORS.length]}25`,
                                    }}>
                                        {t.name}: {t.value}
                                    </span>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '60px' }}>No data available</p>
                    )}
                </div>

                {/* Rating Distribution */}
                <div className="glass-card-static">
                    <div className="accent-line" style={{ background: 'var(--gradient-primary)' }} />
                    <h2 className="section-title">📊 Problem Ratings</h2>
                    {ratingData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={380}>
                            <BarChart data={ratingData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(136,146,176,0.06)" />
                                <XAxis dataKey="rating" stroke="#5a6380" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#5a6380" tick={{ fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: 'rgba(15,20,45,0.95)', border: '1px solid rgba(136,146,176,0.15)', borderRadius: '10px' }} />
                                <Bar dataKey="count" name="Problems" radius={[6, 6, 0, 0]}>
                                    {ratingData.map((entry, i) => (
                                        <Cell key={i} fill={ratingColor(entry.rating)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '60px' }}>No data available</p>
                    )}
                </div>
            </div>
        </div>
    );
}
