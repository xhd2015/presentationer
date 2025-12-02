import type { ConceptItem } from './types';

export interface ConceptCardPreviewProps {
    items: ConceptItem[];
    columns?: number;
}

const colorMap: Record<string, { border: string, text: string, shadow: string }> = {
    blue: { border: '#3b82f6', text: '#60a5fa', shadow: 'rgba(30, 58, 138, 0.2)' },
    green: { border: '#22c55e', text: '#4ade80', shadow: 'rgba(20, 83, 45, 0.2)' },
    purple: { border: '#a855f7', text: '#c084fc', shadow: 'rgba(88, 28, 135, 0.2)' },
    red: { border: '#ef4444', text: '#f87171', shadow: 'rgba(127, 29, 29, 0.2)' },
    yellow: { border: '#eab308', text: '#facc15', shadow: 'rgba(113, 63, 18, 0.2)' },
    orange: { border: '#f97316', text: '#fb923c', shadow: 'rgba(124, 45, 18, 0.2)' },
    gray: { border: '#6b7280', text: '#9ca3af', shadow: 'rgba(55, 65, 81, 0.2)' },
};

const defaultColor = colorMap.gray;

export function ConceptCardPreview({ items, columns = 3 }: ConceptCardPreviewProps) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: '32px',
            width: '100%',
            padding: '32px',
            justifyItems: 'center',
            boxSizing: 'border-box'
        }}>
            {items.map((item, index) => {
                const colorKey = (item.color || 'gray').toLowerCase();
                const theme = colorMap[colorKey] || defaultColor;

                return (
                    <div key={index} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '240px',
                        padding: '24px',
                        border: `2px solid ${theme.border}`,
                        borderRadius: '12px',
                        backgroundColor: 'rgba(31, 41, 55, 0.8)', // bg-gray-800/80
                        boxShadow: `0 10px 15px -3px ${theme.shadow}`,
                    }}>
                        <div style={{
                            fontSize: '48px',
                            marginBottom: '16px'
                        }}>
                            {item.icon}
                        </div>
                        <h3 style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: theme.text,
                            marginBottom: '8px',
                            marginTop: 0,
                            textAlign: 'center'
                        }}>
                            {item.title}
                        </h3>
                        <p style={{
                            fontSize: '12px',
                            color: '#9ca3af',
                            textAlign: 'center',
                            fontFamily: 'monospace',
                            margin: 0,
                            lineHeight: 1.5,
                            whiteSpace: 'pre-wrap'
                        }}>
                            {item.description}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}

