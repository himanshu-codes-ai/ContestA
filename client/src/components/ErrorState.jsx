import React from 'react';

export default function ErrorState({ message, onRetry }) {
    return (
        <div className="page-enter" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '50vh', gap: '16px',
        }}>
            <div style={{
                background: 'var(--color-bg-card)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: 'var(--radius-md)',
                padding: '28px 36px',
                textAlign: 'center',
                maxWidth: '440px',
                position: 'relative',
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: '1px', background: 'var(--gradient-red)',
                }} />

                <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px', color: 'var(--color-accent-red)',
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </div>

                <h3 style={{
                    fontSize: '16px', fontWeight: 600,
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--color-text-bright)', marginBottom: '8px',
                }}>
                    Something went wrong
                </h3>
                <p style={{
                    color: 'var(--color-text-secondary)', fontSize: '13px',
                    lineHeight: 1.6, fontFamily: 'var(--font-sans)',
                }}>
                    {message || 'An unexpected error occurred. Please try again.'}
                </p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="btn-primary"
                        style={{ marginTop: '16px', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--color-accent-red)' }}
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
}
