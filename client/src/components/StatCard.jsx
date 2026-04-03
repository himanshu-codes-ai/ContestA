import React from 'react';

export default function StatCard({ icon, label, value, subtitle, color, trend }) {
    return (
        <div className="glass-card-static" style={{ padding: '18px' }}>
            <p style={{
                fontSize: '11px', fontWeight: 500, color: 'var(--color-text-muted)',
                marginBottom: '6px',
                fontFamily: 'var(--font-sans)',
            }}>
                {label}
            </p>
            <p style={{
                fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-code)',
                letterSpacing: '-0.02em', lineHeight: 1.1,
                color: 'var(--color-text-bright)',
            }}>
                {value}
            </p>
            {subtitle && (
                <p style={{
                    fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px',
                    fontFamily: 'var(--font-sans)',
                }}>
                    {subtitle}
                </p>
            )}
            {trend !== undefined && (
                <div style={{
                    marginTop: '8px', fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-sans)',
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '2px 8px', borderRadius: 'var(--radius-full)',
                    background: trend >= 0 ? 'var(--color-accent-green-subtle)' : 'rgba(239, 68, 68, 0.08)',
                    color: trend >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
                    border: `1px solid ${trend >= 0 ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)'}`,
                }}>
                    {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}
                </div>
            )}
        </div>
    );
}
