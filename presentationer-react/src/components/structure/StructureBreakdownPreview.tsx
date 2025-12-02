import React from 'react';

export interface StructureItem {
    title: string;
    description?: string;
    content?: string;
    color?: string; // hex or name like 'blue', 'green', 'purple'
}

export interface StructureBreakdownPreviewProps {
    items: StructureItem[];
    columns?: number;
}

const colorMap: Record<string, { border: string, bg: string, text: string }> = {
    blue: { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', text: '#93c5fd' },
    green: { border: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', text: '#86efac' },
    purple: { border: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)', text: '#d8b4fe' },
    red: { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', text: '#fca5a5' },
    yellow: { border: '#eab308', bg: 'rgba(234, 179, 8, 0.1)', text: '#fde047' },
    orange: { border: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', text: '#fdba74' },
    gray: { border: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', text: '#d1d5db' },
};

export const StructureBreakdownItem: React.FC<{ item: StructureItem }> = ({ item }) => {
    const colorKey = (item.color || 'gray').toLowerCase();
    const theme = colorMap[colorKey] || colorMap.gray;
    const borderColor = item.color?.startsWith('#') ? item.color : theme.border;
    const codeColor = item.color?.startsWith('#') ? item.color : theme.text;

    return (
        <div style={{
            borderLeft: `4px solid ${borderColor}`,
            paddingLeft: '16px',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '8px',
                marginTop: 0
            }}>{item.title}</h3>

            {item.description && (
                <p style={{
                    fontSize: '14px',
                    opacity: 0.8,
                    marginBottom: '8px',
                    lineHeight: 1.5
                }}>{item.description}</p>
            )}

            {item.content && (
                <div style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: codeColor,
                    whiteSpace: 'pre-wrap'
                }}>
                    {item.content}
                </div>
            )}
        </div>
    );
};

export const StructureBreakdownPreview: React.FC<StructureBreakdownPreviewProps> = ({ items, columns = 3 }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: '16px',
            width: '100%',
            padding: '24px',
            backgroundColor: '#1e1e1e', // Dark theme background match
            color: 'white',
            boxSizing: 'border-box'
        }}>
            {items.map((item, index) => (
                <StructureBreakdownItem key={index} item={item} />
            ))}
        </div>
    );
};
