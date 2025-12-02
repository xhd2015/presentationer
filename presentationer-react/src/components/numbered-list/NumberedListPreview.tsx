import type { NumberedItem } from './types';

export interface NumberedListPreviewProps {
    items: NumberedItem[];
    columns?: number;
}

const colorMap: Record<string, string> = {
    blue: '#60a5fa',   // text-blue-400
    green: '#4ade80',  // text-green-400
    purple: '#c084fc', // text-purple-400
    red: '#f87171',    // text-red-400
    yellow: '#facc15', // text-yellow-400
    orange: '#fb923c', // text-orange-400
    gray: '#9ca3af',   // text-gray-400
};

export function NumberedListPreview({ items, columns = 3 }: NumberedListPreviewProps) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: '24px', // gap-6
            width: '100%',
            padding: '32px 0', // pt-8
            boxSizing: 'border-box',
            color: '#333'
        }}>
            {items.map((item, index) => {
                const colorKey = (item.color || 'gray').toLowerCase();
                const titleColor = colorMap[colorKey] || colorMap.gray;

                return (
                    <div key={index} style={{
                        backgroundColor: 'transparent', // bg-transparent
                        padding: '24px', // p-6
                        borderRadius: '12px', // rounded-xl
                        border: 'none', // no border
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        textAlign: 'left'
                    }}>
                        <div style={{
                            fontSize: '36px', // text-4xl
                            marginBottom: '16px', // mb-4
                            opacity: 0.3 // slightly more transparent for black text
                        }}>
                            {item.number}
                        </div>
                        <h3 style={{
                            fontSize: '20px', // text-xl
                            fontWeight: 'bold',
                            color: titleColor,
                            marginBottom: '8px', // mb-2
                            marginTop: 0
                        }}>
                            {item.title}
                        </h3>
                        <p style={{
                            fontSize: '14px', // text-sm
                            opacity: 0.8,
                            margin: 0,
                            lineHeight: 1.5
                        }}>
                            {item.description}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
