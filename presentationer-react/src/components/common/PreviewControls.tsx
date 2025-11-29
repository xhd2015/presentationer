import React from 'react';

export interface PreviewControlsProps {
    exportWidth: string;
    setExportWidth: (width: string) => void;
    exportHeight: string;
    setExportHeight: (height: string) => void;
}

export const PreviewControls: React.FC<PreviewControlsProps> = ({
    exportWidth,
    setExportWidth,
    exportHeight,
    setExportHeight,
}) => {
    return (
        <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <label>
                Width:
                <input
                    type="number"
                    value={exportWidth}
                    onChange={(e) => setExportWidth(e.target.value)}
                    placeholder="Auto"
                    style={{ marginLeft: '5px', width: '60px' }}
                />
            </label>
            <label>
                Height:
                <input
                    type="number"
                    value={exportHeight}
                    onChange={(e) => setExportHeight(e.target.value)}
                    placeholder="Auto"
                    style={{ marginLeft: '5px', width: '60px' }}
                />
            </label>
        </div>
    );
};

