import React from 'react';

export default function LoadingSpinner({ message = 'Loading data...' }) {
    return (
        <div className="page-enter" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '50vh', gap: '20px',
        }}>
            <div style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--border-color-dim)',
                borderRadius: '2px',
                padding: '24px 32px',
                minWidth: '300px',
                textAlign: 'center',
            }}>
                <div style={{
                    fontSize: '11px', color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
                    marginBottom: '16px',
                }}>
                    Processing...
                </div>

                {/* Progress bar */}
                <div style={{
                    width: '100%', height: '3px', background: 'rgba(0, 255, 65, 0.08)',
                    borderRadius: '1px', overflow: 'hidden', marginBottom: '16px',
                }}>
                    <div style={{
                        height: '100%', background: 'var(--color-accent-green)',
                        borderRadius: '1px',
                        animation: 'loading-progress 2s ease-in-out infinite',
                        boxShadow: '0 0 10px rgba(0, 255, 65, 0.5)',
                    }} />
                </div>

                <p style={{
                    color: 'var(--color-accent-green)', fontSize: '13px', fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                }}>
                    {message}<span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
                </p>
                <p style={{
                    color: 'var(--color-text-muted)', fontSize: '11px', marginTop: '6px',
                    fontFamily: 'var(--font-mono)',
                }}>
                    This may take a moment
                </p>
            </div>

            <style>{`
                @keyframes loading-progress {
                    0% { width: 0%; }
                    50% { width: 70%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
}
