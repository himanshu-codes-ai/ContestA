import React from 'react';

export default function DailyProblemWidget({ history }) {
    const today = new Date();
    const currentMonth = today.getUTCMonth();
    const currentYear = today.getUTCFullYear();
    
    const daysInMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate();
    const firstDayOfWeek = new Date(Date.UTC(currentYear, currentMonth, 1)).getUTCDay();
    
    const historyMap = {};
    if (history) {
        history.forEach(item => {
            historyMap[item.date] = item;
        });
    }

    const todayStr = today.toISOString().split('T')[0];

    const weeks = [];
    let currentWeek = Array(7).fill(null);
    let dayCursor = firstDayOfWeek;
    
    for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(Date.UTC(currentYear, currentMonth, day));
        const dateStr = d.toISOString().split('T')[0];
        
        currentWeek[dayCursor] = {
            day,
            dateStr,
            isToday: dateStr === todayStr,
            isFuture: d > today,
            isPast: d < today && dateStr !== todayStr,
            data: historyMap[dateStr]
        };
        
        dayCursor++;
        if (dayCursor === 7 || day === daysInMonth) {
            weeks.push(currentWeek);
            currentWeek = Array(7).fill(null);
            dayCursor = 0;
        }
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const solvedCount = history ? history.filter(h => h.isSolved).length : 0;
    const missedCount = history ? history.filter(h => !h.isSolved).length : 0;

    return (
        <div className="glass-card-static" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-sans)', color: 'var(--color-text-bright)' }}>
                    {monthNames[currentMonth]} {currentYear}
                </h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent-green)' }} />
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>{solvedCount}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff3333' }} />
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>{missedCount}</span>
                    </div>
                </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '6px' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 500, padding: '2px 0' }}>{d}</div>
                ))}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {weeks.map((week, wIdx) => (
                    <div key={wIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                        {week.map((dayObj, dIdx) => {
                            if (!dayObj) return <div key={dIdx} />;
                            
                            let bgColor = 'transparent';
                            let borderColor = 'transparent';
                            let textColor = 'var(--color-text-secondary)';
                            let indicator = null;
                            let cellRadius = '4px';

                            if (dayObj.isToday) {
                                borderColor = 'var(--color-accent-cyan)';
                                bgColor = 'rgba(0, 212, 255, 0.08)';
                                textColor = 'var(--color-accent-cyan)';
                                cellRadius = '50%';
                            } else if (dayObj.isFuture) {
                                textColor = 'var(--color-text-muted)';
                                bgColor = 'rgba(255, 255, 255, 0.01)';
                            }

                            if (dayObj.data) {
                                if (dayObj.data.isSolved) {
                                    bgColor = 'rgba(34, 197, 94, 0.12)';
                                    borderColor = 'rgba(34, 197, 94, 0.25)';
                                    textColor = 'var(--color-accent-green)';
                                    cellRadius = '50%';
                                    indicator = (
                                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-green)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', bottom: '2px', right: '2px' }}>
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    );
                                } else if (dayObj.isPast || dayObj.isToday) {
                                    bgColor = 'rgba(239, 68, 68, 0.06)';
                                    borderColor = 'rgba(239, 68, 68, 0.15)';
                                    textColor = 'var(--color-text-secondary)';
                                    cellRadius = '50%';
                                    indicator = (
                                        <div style={{ 
                                            position: 'absolute', bottom: '3px', right: '3px', 
                                            width: '5px', height: '5px', borderRadius: '50%', background: '#ef4444' 
                                        }} />
                                    );
                                }
                            }

                            return (
                                <div key={dIdx} style={{
                                    height: '32px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: bgColor,
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: cellRadius,
                                    fontSize: '11px',
                                    fontFamily: 'var(--font-mono)',
                                    color: textColor,
                                    position: 'relative',
                                    cursor: dayObj.data ? 'default' : 'default',
                                    fontWeight: dayObj.isToday ? 700 : 400,
                                }}>
                                    {dayObj.day}
                                    {indicator}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
