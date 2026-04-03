import React from 'react';

export default function LoadingSpinner({ message = 'Loading data...' }) {
    return (
        <div className="page-enter" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '50vh', gap: '20px',
        }}>
            <div style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '24px 32px',
                minWidth: '300px',
                textAlign: 'center',
            }}>
                {/* Spinner */}
                <div style={{
                    width: '32px', height: '32px', margin: '0 auto 16px',
                    border: '2px solid var(--border-color)',
                    borderTopColor: 'var(--color-accent-green)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />

                <p style={{
                    color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 500,
                    fontFamily: 'var(--font-sans)',
                }}>
                    {message}
                </p>
                <p style={{
                    color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '4px',
                    fontFamily: 'var(--font-sans)',
                }}>
                    This may take a moment
                </p>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
