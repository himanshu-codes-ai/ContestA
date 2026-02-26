import React from 'react';

export default function ErrorState({ message, onRetry }) {
    return (
        <div className="page-enter" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '50vh', gap: '16px',
        }}>
            <div style={{
                width: '72px', height: '72px', borderRadius: '20px',
                background: 'rgba(255, 71, 87, 0.1)', border: '1px solid rgba(255, 71, 87, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '32px',
            }}>
                !
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.01em' }}>Something went wrong</h3>
            <p style={{
                color: 'var(--color-text-secondary)', maxWidth: '420px',
                textAlign: 'center', fontSize: '14px', lineHeight: 1.6,
            }}>
                {message || 'An unexpected error occurred. Please try again.'}
            </p>
            {onRetry && (
                <button onClick={onRetry} className="btn-primary" style={{ marginTop: '8px' }}>
                    ↻ Try Again
                </button>
            )}
        </div>
    );
}
