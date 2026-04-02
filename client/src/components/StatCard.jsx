import React from 'react';

export default function StatCard({ icon, label, value, subtitle, color, trend }) {
    return (
        <div className="glass-card" style={{ padding: '18px 20px', cursor: 'default' }}>
            <div className="accent-line" style={{ background: color || 'var(--gradient-green)' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                    <p style={{
                        fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)',
                        letterSpacing: '0.04em', marginBottom: '8px',
                        fontFamily: 'var(--font-mono)',
                    }}>
                        {label}
                    </p>
                    <p style={{
                        fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-code)',
                        letterSpacing: '-0.02em', lineHeight: 1.1,
                        color: 'var(--color-text-bright)',
                    }}>
                        {value}
                    </p>
                    {subtitle && (
                        <p style={{
                            fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px',
                            fontFamily: 'var(--font-mono)',
                        }}>
                            {subtitle}
                        </p>
                    )}
                    {trend !== undefined && (
                        <div style={{
                            marginTop: '8px', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '2px 8px', borderRadius: '2px',
                            background: trend >= 0 ? 'rgba(0, 255, 65, 0.08)' : 'rgba(255, 51, 51, 0.08)',
                            color: trend >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
                            border: `1px solid ${trend >= 0 ? 'rgba(0, 255, 65, 0.2)' : 'rgba(255, 51, 51, 0.2)'}`,
                        }}>
                            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}
                        </div>
                    )}
                </div>
                <div style={{
                    fontSize: '22px', opacity: 0.4,
                    width: '40px', height: '40px', borderRadius: '2px',
                    background: 'rgba(0, 255, 65, 0.04)',
                    border: '1px solid rgba(0, 255, 65, 0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
