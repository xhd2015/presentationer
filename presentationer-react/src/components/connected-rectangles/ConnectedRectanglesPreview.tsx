import React from 'react';
import type { ConnectedRectanglesConfig } from './types';

interface ConnectedRectanglesPreviewProps {
    jsonInput: string;
    // Props below are handled by parent PreviewContainer
    exportWidth?: string;
    exportHeight?: string;
    onDimensionsChange?: (w: number, h: number) => void;
}

export const ConnectedRectanglesPreview: React.FC<ConnectedRectanglesPreviewProps> = ({ jsonInput }) => {
    let config: ConnectedRectanglesConfig = { nodes: [] };
    try {
        config = JSON.parse(jsonInput);
    } catch (e) { }

    const { layout = 'row', nodes = [], gap = 20 } = config;

    const getColor = (c?: string) => {
        if (c === 'red') return '#ef4444';
        if (c === 'blue') return '#3b82f6';
        if (c === 'yellow') return '#eab308';
        return c || '#646cff';
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: layout === 'column' ? 'column' : 'row',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
            gap: `${gap}px`,
            padding: '20px',
            overflow: 'auto'
        }}>
            {nodes.map((node, index) => {
                const color = getColor(node.color);
                const isLast = index === nodes.length - 1;

                return (
                    <React.Fragment key={node.id}>
                        {/* Node */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                                width: '120px',
                                height: '100px',
                                border: `2px solid ${color}`,
                                borderRadius: '12px',
                                backgroundColor: '#1f2937', // dark bg like slides
                                color: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 10px 15px -3px ${color}40`,
                                animation: node.isPulse ? 'pulse 2s infinite' : 'none',
                                transition: 'transform 0.2s',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {node.icon && <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{node.icon}</div>}
                                <div style={{ fontWeight: 'bold', color }}>{node.text}</div>
                            </div>
                            {node.subtext && <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>{node.subtext}</div>}
                        </div>

                        {/* Arrow */}
                        {!isLast && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                opacity: 0.7
                            }}>
                                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '4px' }}>
                                    {config.edges?.[index]?.label || ''}
                                </div>
                                <div style={{
                                    height: layout === 'column' ? '40px' : '2px',
                                    width: layout === 'column' ? '2px' : '40px',
                                    backgroundColor: '#4b5563',
                                    position: 'relative'
                                }}>
                                    {/* Arrowhead */}
                                    <div style={{
                                        position: 'absolute',
                                        [layout === 'column' ? 'bottom' : 'right']: '-4px',
                                        [layout === 'column' ? 'left' : 'top']: '-3px',
                                        width: '0',
                                        height: '0',
                                        borderLeft: '4px solid transparent',
                                        borderRight: '4px solid transparent',
                                        borderTop: layout === 'column' ? '8px solid #4b5563' : 'none', // Down
                                        borderBottom: layout === 'column' ? 'none' : 'none', // Wait, horizontal needs Left/Top/Bottom
                                        // Let's just use a transform rotate
                                        // Horizontal: Point Right
                                        borderTopWidth: layout === 'column' ? '8px' : '4px',
                                        borderBottomWidth: layout === 'column' ? '0' : '4px',
                                        borderLeftWidth: layout === 'column' ? '4px' : '8px',
                                        // CSS Triangle is hard inline. 
                                        // Using simple box for line.
                                        // Arrowhead using border hack:
                                        borderStyle: 'solid',
                                        borderColor: layout === 'column'
                                            ? '#4b5563 transparent transparent transparent'
                                            : 'transparent transparent transparent #4b5563'
                                    }} />
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: .8; transform: scale(0.98); }
                }
            `}</style>
        </div>
    );
};
