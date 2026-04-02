import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSubmissions, fetchRating } from '../services/api';
import { getUnsolvedProblems } from '../utils/dataProcessing';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export default function UpsolvingTracker() {
    const { handle } = useParams();
    const navigate = useNavigate();
    const [inputHandle, setInputHandle] = useState('');
    const [unsolved, setUnsolved] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [doneSet, setDoneSet] = useState(new Set());

    useEffect(() => { if (handle) loadData(); }, [handle]);

    async function loadData() {
        setLoading(true); setError(null);
        try {
            const [subs, ratings] = await Promise.all([fetchSubmissions(handle), fetchRating(handle)]);
            setUnsolved(getUnsolvedProblems(subs, ratings));
        } catch (err) { setError(err.response?.data?.comment || err.message); }
        finally { setLoading(false); }
    }

    const toggleDone = (key) => {
        setDoneSet((prev) => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });
    };

    if (!handle) {
        return (
            <div className="prompt-state page-enter">
                <div style={{ fontSize: '40px', marginBottom: '8px', animation: 'float 3s ease-in-out infinite', color: 'var(--color-accent-green)' }}>◎</div>
                <h2>Upsolving Tracker</h2>
                <p>Track unsolved problems from recent contests and mark your progress</p>
                <form onSubmit={(e) => { e.preventDefault(); if (inputHandle.trim()) navigate(`/upsolving/${inputHandle.trim()}`); }} style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '400px' }}>
                    <input value={inputHandle} onChange={(e) => setInputHandle(e.target.value)} placeholder="Codeforces handle..." className="input-field" />
                    <button type="submit" className="btn-primary">Track →</button>
                </form>
            </div>
        );
    }

    if (loading) return <LoadingSpinner message={`Finding unsolved problems for ${handle}...`} />;
    if (error) return <ErrorState message={error} onRetry={loadData} />;

    const completed = doneSet.size;

    return (
        <div className="page-enter">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-text-bright)' }}>
                        Upsolving <span style={{ color: 'var(--color-accent-green)' }}>Tracker</span>
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                        Unsolved problems from recent contests · {handle}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: '2px', padding: '8px 14px', textAlign: 'center' }}>
                        <p style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-code)', color: 'var(--color-accent-green)' }}>{unsolved.length}</p>
                        <p style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Pending</p>
                    </div>
                    <div style={{ background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: '2px', padding: '8px 14px', textAlign: 'center' }}>
                        <p style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-code)', color: 'var(--color-accent-amber)' }}>
                            {unsolved.length > 0 ? ((completed / unsolved.length) * 100).toFixed(1) : 0}%
                        </p>
                        <p style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Done</p>
                    </div>
                </div>
            </div>

            {unsolved.length === 0 ? (
                <div className="glass-card-static" style={{ textAlign: 'center', padding: '60px 40px' }}>
                    <div className="accent-line" style={{ background: 'var(--gradient-green)' }} />
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>✓</div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px', fontFamily: 'var(--font-display)', color: 'var(--color-accent-green)' }}>
                        All caught up!
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                        You've solved all problems from your recent contests. Great work!
                    </p>
                </div>
            ) : (
                <div className="glass-card-static">
                    <div className="accent-line" style={{ background: 'var(--gradient-green)' }} />
                    <h2 className="section-title">■ Problems to Upsolve</h2>
                    <div style={{
                        display: 'grid', gridTemplateColumns: '36px 1fr auto auto auto',
                        gap: '12px', alignItems: 'center', padding: '8px 16px', marginBottom: '4px',
                        fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)',
                        borderBottom: '1px solid var(--border-color-dim)',
                    }}>
                        <span></span><span>Problem</span><span>Rating</span><span>Tags</span><span>Link</span>
                    </div>
                    {unsolved.map((p) => {
                        const key = `${p.contestId}-${p.index}`;
                        const isDone = doneSet.has(key);
                        return (
                            <div key={key} style={{
                                display: 'grid', gridTemplateColumns: '36px 1fr auto auto auto',
                                gap: '12px', alignItems: 'center', padding: '12px 16px',
                                opacity: isDone ? 0.4 : 1, borderBottom: '1px solid rgba(48,54,61,0.3)',
                                transition: 'all 0.2s ease', background: isDone ? 'rgba(0,255,65,0.02)' : 'transparent',
                            }}>
                                <button onClick={() => toggleDone(key)} style={{
                                    width: '22px', height: '22px', borderRadius: '2px', flexShrink: 0,
                                    border: isDone ? 'none' : '1px solid var(--border-color-hover)',
                                    background: isDone ? 'var(--color-accent-green)' : 'transparent',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: isDone ? '#0a0e0f' : 'transparent', fontSize: '11px', fontWeight: 700,
                                    boxShadow: isDone ? '0 0 10px rgba(0,255,65,0.3)' : 'none',
                                }}>
                                    {isDone ? '✓' : ''}
                                </button>
                                <a href={p.link} target="_blank" rel="noopener noreferrer" style={{
                                    color: 'var(--color-accent-green)', fontWeight: 600, fontSize: '12px',
                                    textDecoration: isDone ? 'line-through' : 'none', fontFamily: 'var(--font-mono)',
                                }}>
                                    {p.index}. {p.name}
                                </a>
                                {p.rating ? (
                                    <span style={{ fontFamily: 'var(--font-code)', fontWeight: 700, fontSize: '11px', padding: '3px 10px', borderRadius: '2px',
                                        background: 'rgba(255,184,0,0.06)', color: 'var(--color-accent-amber)', border: '1px solid rgba(255,184,0,0.15)' }}>
                                        {p.rating}
                                    </span>
                                ) : <span />}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                                    {p.tags?.slice(0, 2).map((tag) => <span key={tag} className="tag-chip">{tag}</span>)}
                                    {p.tags?.length > 2 && <span className="tag-chip" style={{ opacity: 0.5 }}>+{p.tags.length - 2}</span>}
                                </div>
                                <a href={`https://codeforces.com/blog/entry/${p.contestId}`} target="_blank" rel="noopener noreferrer"
                                    className="btn-secondary" style={{ padding: '4px 10px', fontSize: '10px', flexShrink: 0, borderRadius: '2px' }}>
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
