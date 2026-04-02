import React from 'react';

export default function ErrorState({ message, onRetry }) {
    return (
        <div className="page-enter" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '50vh', gap: '16px',
        }}>
            <div style={{
                background: 'var(--color-bg-card)',
                border: '1px solid rgba(255, 51, 51, 0.3)',
                borderRadius: '2px',
                padding: '28px 36px',
                textAlign: 'center',
                maxWidth: '440px',
                position: 'relative',
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: '2px', background: 'var(--gradient-red)',
                }} />

                <div style={{
                    width: '48px', height: '48px', borderRadius: '2px',
                    background: 'rgba(255, 51, 51, 0.08)', border: '1px solid rgba(255, 51, 51, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', margin: '0 auto 16px', color: 'var(--color-accent-red)',
                    fontFamily: 'var(--font-mono)', fontWeight: 700,
                }}>
                    !
                </div>

                <h3 style={{
                    fontSize: '16px', fontWeight: 700, letterSpacing: '0.02em',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-bright)', marginBottom: '8px',
                }}>
                    Something went wrong
                </h3>
                <p style={{
                    color: 'var(--color-text-secondary)', fontSize: '12px',
                    lineHeight: 1.6, fontFamily: 'var(--font-mono)',
                }}>
                    {message || 'An unexpected error occurred. Please try again.'}
                </p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="btn-primary"
                        style={{ marginTop: '16px', borderColor: 'var(--color-accent-red)', color: 'var(--color-accent-red)' }}
                    >
                        ↻ Try Again
                    </button>
                )}
            </div>
        </div>
    );
}
