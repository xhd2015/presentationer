import type { StatItem } from './types';

export interface StatsPreviewProps {
    items: StatItem[];
    columns?: number;
}

const colorMap: Record<string, { bg: string, text: string }> = {
    blue: { bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa' },
    green: { bg: 'rgba(34, 197, 94, 0.1)', text: '#4ade80' },
    purple: { bg: 'rgba(168, 85, 247, 0.1)', text: '#c084fc' },
    red: { bg: 'rgba(239, 68, 68, 0.1)', text: '#f87171' },
    yellow: { bg: 'rgba(234, 179, 8, 0.1)', text: '#facc15' },
    orange: { bg: 'rgba(249, 115, 22, 0.1)', text: '#fb923c' },
    gray: { bg: 'rgba(107, 114, 128, 0.1)', text: '#9ca3af' },
};

export function StatsItemView({ item }: { item: StatItem }) {
    const colorKey = (item.color || 'gray').toLowerCase();
    const theme = colorMap[colorKey] || colorMap.gray;

    return (
        <div style={{
            backgroundColor: theme.bg,
            padding: '24px', // p-6 (p-4 in example, but p-6 looks better for stats)
            borderRadius: '12px', // rounded-xl
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
        }}>
            <div style={{
                fontSize: '36px', // text-4xl
                fontWeight: 'bold',
                color: theme.text,
                marginBottom: '8px'
            }}>
                {item.value}
            </div>
            <div style={{
                fontSize: '14px', // text-sm
                opacity: 0.8,
                color: '#1f2937' // gray-800
            }}>
                {item.label}
            </div>
        </div>
    );
}

export function StatsPreview({ items, columns = 3 }: StatsPreviewProps) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: '16px',
            width: '100%',
            padding: '24px',
            color: '#333',
            boxSizing: 'border-box'
        }}>
            {items.map((item, index) => (
                <StatsItemView key={index} item={item} />
            ))}
        </div>
    );
}
