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

    useEffect(() => {
        if (handle) loadData();
    }, [handle]);

    async function loadData() {
        setLoading(true);
        setError(null);
        try {
            const [subs, ratings] = await Promise.all([fetchSubmissions(handle), fetchRating(handle)]);
            setUnsolved(getUnsolvedProblems(subs, ratings));
        } catch (err) {
            setError(err.response?.data?.comment || err.message);
        } finally {
            setLoading(false);
        }
    }

    const toggleDone = (key) => {
        setDoneSet((prev) => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    if (!handle) {
        return (
            <div className="prompt-state page-enter">
                <div style={{ fontSize: '48px', marginBottom: '8px', animation: 'float 3s ease-in-out infinite' }}>◎</div>
                <h2>Upsolving Tracker</h2>
                <p>Track unsolved problems from your recent contests and mark your progress</p>
                <form onSubmit={(e) => { e.preventDefault(); if (inputHandle.trim()) navigate(`/upsolving/${inputHandle.trim()}`); }} style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '400px' }}>
                    <input value={inputHandle} onChange={(e) => setInputHandle(e.target.value)} placeholder="Codeforces handle..." className="input-field" />
                    <button type="submit" className="btn-primary">Track →</button>
                </form>
            </div>
        );
    }

    if (loading) return <LoadingSpinner message={`Finding unsolved problems for ${handle}...`} />;
    if (error) return <ErrorState message={error} onRetry={loadData} />;

    const completed = [...doneSet].length;

    return (
        <div className="page-enter">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        Upsolving Tracker — <span className="gradient-text">{handle}</span>
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '4px' }}>
                        {unsolved.length} unsolved problems from recent contests
                    </p>
                </div>
                {unsolved.length > 0 && (
                    <div className="badge badge-green" style={{ fontSize: '12px' }}>
                        ✓ {completed} / {unsolved.length} completed
                    </div>
                )}
            </div>

            {unsolved.length === 0 ? (
                <div className="glass-card-static" style={{ textAlign: 'center', padding: '80px 40px' }}>
                    <div className="accent-line" style={{ background: 'var(--gradient-success)' }} />
                    <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>All caught up!</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                        You've solved all problems from your recent contests. Great job!
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {unsolved.map((p, idx) => {
                        const key = `${p.contestId}-${p.index}`;
                        const isDone = doneSet.has(key);
                        return (
                            <div
                                key={key}
                                className="glass-card"
                                style={{
                                    padding: '18px 24px',
                                    display: 'flex', alignItems: 'center', gap: '16px',
                                    opacity: isDone ? 0.45 : 1,
                                    animationDelay: `${idx * 0.03}s`,
                                    animationFillMode: 'backwards',
                                }}
                            >
                                {/* Check button */}
                                <button
                                    onClick={() => toggleDone(key)}
                                    style={{
                                        width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0,
                                        border: isDone ? 'none' : '2px solid var(--border-color-hover)',
                                        background: isDone ? 'var(--color-accent-green)' : 'transparent',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: '12px', fontWeight: 700,
                                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: isDone ? '0 0 12px rgba(0, 230, 140, 0.3)' : 'none',
                                    }}
                                >
                                    {isDone ? '✓' : ''}
                                </button>

                                {/* Problem info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <a
                                        href={p.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            color: 'var(--color-accent-blue)', fontWeight: 600, fontSize: '14px',
                                            textDecoration: isDone ? 'line-through' : 'none',
                                            transition: 'color 0.2s',
                                        }}
                                        onMouseEnter={(e) => e.target.style.color = '#6da9ff'}
                                        onMouseLeave={(e) => e.target.style.color = 'var(--color-accent-blue)'}
                                    >
                                        {p.index}. {p.name}
                                    </a>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                                        {p.tags?.slice(0, 4).map((tag) => (
                                            <span key={tag} className="tag-chip">{tag}</span>
                                        ))}
                                        {p.tags?.length > 4 && (
                                            <span className="tag-chip" style={{ opacity: 0.6 }}>+{p.tags.length - 4}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Rating */}
                                {p.rating && (
                                    <span style={{
                                        fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px',
                                        padding: '5px 12px', borderRadius: '8px',
                                        background: 'rgba(168, 85, 247, 0.1)',
                                        color: 'var(--color-accent-purple)',
                                        border: '1px solid rgba(168, 85, 247, 0.15)',
                                    }}>
                                        {p.rating}
                                    </span>
                                )}

                                {/* Editorial link */}
                                <a
                                    href={`https://codeforces.com/blog/entry/${p.contestId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary"
                                    style={{ padding: '6px 14px', fontSize: '11px', flexShrink: 0, borderRadius: '8px' }}
                                >
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
