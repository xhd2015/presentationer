import React from 'react';
import { MdRefresh } from 'react-icons/md';

export interface ChartEditorCoreProps {
    jsonInput: string;
    chartType: 'line' | 'bar' | 'pie';
    onChange: (json: string, type: 'line' | 'bar' | 'pie') => void;
    onRefresh?: () => void;
    error?: string | null;
}

export const ChartEditorCore: React.FC<ChartEditorCoreProps> = ({ jsonInput, chartType, onChange, onRefresh, error }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ marginRight: '10px' }}>Chart Type:</label>
                    <select
                        value={chartType}
                        onChange={(e) => onChange(jsonInput, e.target.value as any)}
                        style={{ padding: '4px' }}
                    >
                        <option value="line">Line Chart</option>
                        <option value="bar">Bar Chart</option>
                        <option value="pie">Pie Chart</option>
                    </select>
                </div>
                <button onClick={onRefresh} style={{ cursor: 'pointer', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MdRefresh /> Refresh
                </button>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '5px' }}>Data (JSON Array):</label>
                <textarea
                    value={jsonInput}
                    onChange={(e) => onChange(e.target.value, chartType)}
                    style={{
                        flex: 1,
                        fontFamily: 'monospace',
                        padding: '10px',
                        border: error ? '1px solid red' : '1px solid #ddd',
                        borderRadius: '4px',
                        resize: 'none'
                    }}
                    placeholder='[{"name": "A", "value": 10}, ...]'
                />
                {error && <div style={{ color: 'red', marginTop: '5px', fontSize: '12px' }}>{error}</div>}
            </div>
        </div>
    );
};

