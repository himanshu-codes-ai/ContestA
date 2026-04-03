import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchSubmissions, fetchRating } from '../services/api';
import { getUnsolvedProblems } from '../utils/dataProcessing';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

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

export default function UpsolvingTracker() {
    const { handle } = useParams();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [unsolved, setUnsolved] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [doneSet, setDoneSet] = useState(new Set());

    const finalHandle = handle || profile?.cf_handle;
    useEffect(() => { if (finalHandle) loadData(); }, [finalHandle]);

    async function loadData() {
        setLoading(true); setError(null);
        try {
            const [subs, ratings] = await Promise.all([fetchSubmissions(finalHandle), fetchRating(finalHandle)]);
            setUnsolved(getUnsolvedProblems(subs, ratings));
        } catch (err) { setError(err.response?.data?.comment || err.message); }
        finally { setLoading(false); }
    }

    const toggleDone = (key) => {
        setDoneSet((prev) => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });
    };

    if (!finalHandle) {
        return (
            <div className="prompt-state page-enter">
                <div style={{ fontSize: '40px', marginBottom: '8px', animation: 'float 3s ease-in-out infinite', color: 'var(--color-accent-green)' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                </div>
                <h2>Upsolving Tracker</h2>
                <p>Set your Codeforces handle in your profile to use the Upsolving Tracker.</p>
                <div style={{ marginTop: 12 }}>
                    <button className="btn-primary" onClick={() => navigate('/profile')}>Go to Profile</button>
                </div>
            </div>
        );
    }

    if (loading) return <LoadingSpinner message={`Finding unsolved problems for ${finalHandle}...`} />;
    if (error) return <ErrorState message={error} onRetry={loadData} />;

    const completed = doneSet.size;

    return (
        <div className="page-enter">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--color-text-bright)', letterSpacing: '-0.02em' }}>
                        Upsolving Tracker
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px', fontFamily: 'var(--font-sans)' }}>
                        Unsolved problems from recent contests · {finalHandle}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'var(--color-accent-green-subtle)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 'var(--radius-md)', padding: '10px 16px', textAlign: 'center' }}>
                        <p style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-code)', color: 'var(--color-accent-green)' }}>{unsolved.length}</p>
                        <p style={{ fontSize: '11px', fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)' }}>Pending</p>
                    </div>
                    <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 'var(--radius-md)', padding: '10px 16px', textAlign: 'center' }}>
                        <p style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-code)', color: 'var(--color-accent-amber)' }}>
                            {unsolved.length > 0 ? ((completed / unsolved.length) * 100).toFixed(1) : 0}%
                        </p>
                        <p style={{ fontSize: '11px', fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)' }}>Done</p>
                    </div>
                </div>
            </div>

            {unsolved.length === 0 ? (
                <div className="glass-card-static" style={{ textAlign: 'center', padding: '60px 40px' }}>
                    <div className="accent-line" style={{ background: 'var(--gradient-green)' }} />
                    <div style={{ fontSize: '40px', marginBottom: '16px', color: 'var(--color-accent-green)' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--font-sans)', color: 'var(--color-accent-green)' }}>
                        All caught up!
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', fontFamily: 'var(--font-sans)' }}>
                        You've solved all problems from your recent contests. Great work!
                    </p>
                </div>
            ) : (
                <div className="glass-card-static">
                    <div className="accent-line" style={{ background: 'var(--gradient-green)' }} />
                    <h2 className="section-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                        Problems to Upsolve
                    </h2>
                    <div style={{
                        display: 'grid', gridTemplateColumns: '32px 1fr auto auto auto',
                        gap: '12px', alignItems: 'center', padding: '8px 12px', marginBottom: '4px',
                        fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)',
                        borderBottom: '1px solid var(--border-color)', fontWeight: 500,
                    }}>
                        <span></span><span>Problem</span><span>Rating</span><span>Tags</span><span></span>
                    </div>
                    {unsolved.map((p) => {
                        const key = `${p.contestId}-${p.index}`;
                        const isDone = doneSet.has(key);
                        return (
                            <div key={key} style={{
                                display: 'grid', gridTemplateColumns: '32px 1fr auto auto auto',
                                gap: '12px', alignItems: 'center', padding: '12px',
                                opacity: isDone ? 0.4 : 1, borderBottom: '1px solid var(--border-color-dim)',
                                transition: 'all 0.2s ease', background: isDone ? 'rgba(34,197,94,0.02)' : 'transparent',
                                borderRadius: 'var(--radius-sm)',
                            }}>
                                <button onClick={() => toggleDone(key)} style={{
                                    width: '20px', height: '20px', borderRadius: '4px', flexShrink: 0,
                                    border: isDone ? 'none' : '1.5px solid var(--border-color-hover)',
                                    background: isDone ? 'var(--color-accent-green)' : 'transparent',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: isDone ? '#000' : 'transparent', fontSize: '10px', fontWeight: 700,
                                    transition: 'all 0.15s ease',
                                }}>
                                    ✓
                                </button>
                                <a href={p.link} target="_blank" rel="noopener noreferrer" style={{
                                    color: 'var(--color-text-bright)', fontWeight: 500, fontSize: '13px',
                                    textDecoration: isDone ? 'line-through' : 'none', fontFamily: 'var(--font-sans)',
                                }}>
                                    {p.index}. {p.name}
                                </a>
                                {p.rating ? (
                                    <span style={{ fontFamily: 'var(--font-code)', fontWeight: 600, fontSize: '12px', padding: '3px 10px', borderRadius: 'var(--radius-full)',
                                        background: `${ratingColor(p.rating)}12`, color: ratingColor(p.rating), border: `1px solid ${ratingColor(p.rating)}20` }}>
                                        {p.rating}
                                    </span>
                                ) : <span />}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {p.tags?.slice(0, 2).map((tag) => <span key={tag} className="tag-chip">{tag}</span>)}
                                    {p.tags?.length > 2 && <span className="tag-chip" style={{ opacity: 0.5 }}>+{p.tags.length - 2}</span>}
                                </div>
                                <a href={`https://codeforces.com/blog/entry/${p.contestId}`} target="_blank" rel="noopener noreferrer"
                                    className="btn-ghost" style={{ padding: '4px 10px', fontSize: '11px', flexShrink: 0 }}>
                                    Editorial →
                                </a>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
