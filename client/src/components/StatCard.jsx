import React from 'react';

export default function StatCard({ icon, label, value, subtitle, color, trend }) {
    return (
        <div className="glass-card" style={{ padding: '22px 24px', cursor: 'default' }}>
            {/* Accent */}
            <div className="accent-line" style={{ background: color || 'var(--gradient-primary)' }} />

            <div className="flex items-start justify-between">
                <div style={{ flex: 1 }}>
                    <p style={{
                        fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px',
                    }}>
                        {label}
                    </p>
                    <p style={{
                        fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)',
                        letterSpacing: '-0.02em', lineHeight: 1.1,
                    }}>
                        {value}
                    </p>
                    {subtitle && (
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                            {subtitle}
                        </p>
                    )}
                    {trend !== undefined && (
                        <div style={{
                            marginTop: '8px', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '3px 10px', borderRadius: '6px',
                            background: trend >= 0 ? 'rgba(0, 230, 140, 0.1)' : 'rgba(255, 71, 87, 0.1)',
                            color: trend >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
                        }}>
                            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}
                        </div>
                    )}
                </div>
                <div style={{
                    fontSize: '28px', opacity: 0.5,
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: 'rgba(136, 146, 176, 0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
