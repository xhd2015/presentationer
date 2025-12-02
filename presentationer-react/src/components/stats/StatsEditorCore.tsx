import { useState, useEffect } from 'react';
import { ConfigEditor } from '../common/ConfigEditor';
import { StatsInput } from './StatsInput';
import type { StatItem } from './types';

interface StatsContent {
    items: StatItem[];
    columns?: number;
}

interface StatsEditorCoreProps {
    jsonInput: string;
    onChange: (value: string) => void;
    error?: string | null;
}

export function StatsEditorCore({
    jsonInput,
    onChange,
    error
}: StatsEditorCoreProps) {
    const [items, setItems] = useState<StatItem[]>([]);
    const [columns, setColumns] = useState<number>(3);

    useEffect(() => {
        try {
            const parsed = JSON.parse(jsonInput || '{}');
            setItems(parsed.items || []);
            setColumns(parsed.columns || 3);
        } catch (e) {
            // ignore
        }
    }, [jsonInput]);

    const handleItemsChange = (newItems: StatItem[]) => {
        updateContent(newItems, columns);
    };

    const handleColumnsChange = (newCols: number) => {
        updateContent(items, newCols);
    };

    const updateContent = (newItems: StatItem[], newCols: number) => {
        const content: StatsContent = {
            items: newItems,
            columns: newCols
        };
        onChange(JSON.stringify(content, null, 2));
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <ConfigEditor
                value={jsonInput}
                onChange={onChange}
                validateJson={(json) => {
                    if (typeof json !== 'object' || json === null) return "Content must be an object";
                    return null;
                }}
                renderUI={() => (
                    <div style={{ height: '100%', overflowY: 'auto', padding: '10px' }}>
                        <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Config</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ fontSize: '0.9em' }}>Columns:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="6"
                                    value={columns}
                                    onChange={(e) => handleColumnsChange(parseInt(e.target.value) || 3)}
                                    style={{ width: '60px', padding: '4px' }}
                                />
                            </div>
                        </div>
                        <h3 style={{ margin: '0 0 15px 0', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>Items</h3>
                        <StatsInput items={items} onChange={handleItemsChange} />
                    </div>
                )}
            />
            {error && <div style={{ color: 'red', padding: '10px' }}>{error}</div>}
        </div>
    );
}
