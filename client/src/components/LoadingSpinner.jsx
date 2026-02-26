import React from 'react';

export default function LoadingSpinner({ message = 'Loading data...' }) {
    return (
        <div className="page-enter" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '50vh', gap: '24px',
        }}>
            {/* Animated Rings */}
            <div style={{ position: 'relative', width: '56px', height: '56px' }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    border: '2px solid var(--border-color)',
                    borderTopColor: 'var(--color-accent-blue)',
                    borderRadius: '50%',
                    animation: 'spin 0.9s linear infinite',
                }} />
                <div style={{
                    position: 'absolute', inset: '6px',
                    border: '2px solid var(--border-color)',
                    borderBottomColor: 'var(--color-accent-purple)',
                    borderRadius: '50%',
                    animation: 'spin 1.4s linear infinite reverse',
                }} />
                <div style={{
                    position: 'absolute', inset: '12px',
                    border: '2px solid var(--border-color)',
                    borderTopColor: 'var(--color-accent-cyan)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }} />
            </div>
            <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', fontWeight: 500 }}>{message}</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '4px' }}>This may take a moment</p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
