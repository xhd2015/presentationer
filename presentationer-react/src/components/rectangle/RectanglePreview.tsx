import React from 'react';
import type { RectangleConfig } from './types';

interface RectanglePreviewProps {
    jsonInput: string;
    // Props below are handled by parent PreviewContainer
    exportWidth?: string;
    exportHeight?: string;
    onDimensionsChange?: (w: number, h: number) => void;
}

export const RectanglePreview: React.FC<RectanglePreviewProps> = ({
    jsonInput,
}) => {
    let config: RectangleConfig = { text: 'Rectangle' };
    try {
        config = JSON.parse(jsonInput);
    } catch (e) {
        // ignore
    }

    const {
        text,
        subtext,
        color = '#646cff',
        backgroundColor,
        borderColor,
        textColor,
        icon,
        width = 200,
        height = 150,
        animate,
        items
    } = config;

    // Resolve color name to hex if needed, or just pass through
    const getColor = (c: string) => {
        if (c === 'red') return '#ef4444';
        if (c === 'blue') return '#3b82f6';
        if (c === 'yellow') return '#eab308';
        if (c === 'green') return '#22c55e';
        return c;
    };

    const resolvedBaseColor = getColor(color);
    const resolvedBorderColor = borderColor ? getColor(borderColor) : resolvedBaseColor;
    const resolvedBackgroundColor = backgroundColor ? getColor(backgroundColor) : `${resolvedBorderColor}20`; // Default: low opacity of border
    const resolvedTextColor = textColor ? getColor(textColor) : resolvedBaseColor;

    // We return just the content, styles for wrapper are handled by parent PreviewContainer
    return (
        <div style={{
            width,
            height,
            border: `2px solid ${resolvedBorderColor}`,
            borderRadius: '12px',
            backgroundColor: resolvedBackgroundColor,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 10px 15px -3px ${resolvedBorderColor}40`,
            animation: animate ? 'pulse 2s infinite' : 'none',
            transition: 'transform 0.2s',
            color: resolvedTextColor
        }}>
            {items && items.length > 0 ? (
                items.map((item, idx) => (
                    <div key={idx} style={{
                        fontSize: item.size || (item.type === 'icon' ? '2rem' : '1rem'),
                        color: item.color ? getColor(item.color) : (item.type === 'text' || !item.type ? resolvedTextColor : undefined),
                        fontWeight: item.bold ? 'bold' : 'normal',
                        marginBottom: '4px'
                    }}>
                        {item.value}
                    </div>
                ))
            ) : (
                <>
                    {icon && <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{icon}</div>}
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{text}</div>
                    {subtext && <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '4px', fontFamily: 'monospace' }}>{subtext}</div>}
                </>
            )}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: .8; transform: scale(0.98); }
                }
            `}</style>
        </div>
    );
};
