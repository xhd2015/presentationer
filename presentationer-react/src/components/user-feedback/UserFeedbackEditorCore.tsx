import React, { useState, useEffect } from 'react';
import { ConfigEditor } from '../common/ConfigEditor';
import { UserFeedbackInput } from './UserFeedbackInput';
import type { UserFeedbackItem, UserFeedbackContent } from './types';

interface UserFeedbackEditorCoreProps {
    jsonInput: string;
    onChange: (value: string) => void;
    error?: string | null;
}

export const UserFeedbackEditorCore: React.FC<UserFeedbackEditorCoreProps> = ({
    jsonInput,
    onChange,
    error
}) => {
    const [items, setItems] = useState<UserFeedbackItem[]>([]);
    const [fontSizeMultiplier, setFontSizeMultiplier] = useState<number>(1);

    useEffect(() => {
        try {
            const parsed = JSON.parse(jsonInput || '{}');
            if (Array.isArray(parsed)) {
                setItems(parsed);
                setFontSizeMultiplier(1);
            } else {
                setItems(parsed.items || []);
                setFontSizeMultiplier(parsed.fontSizeMultiplier || 1);
            }
        } catch (e) {
            // ignore
        }
    }, [jsonInput]);

    const handleItemsChange = (newItems: UserFeedbackItem[]) => {
        updateContent(newItems, fontSizeMultiplier);
    };

    const handleFontSizeChange = (newMultiplier: number) => {
        updateContent(items, newMultiplier);
    };

    const updateContent = (newItems: UserFeedbackItem[], newMultiplier: number) => {
        const content: UserFeedbackContent = {
            items: newItems,
            fontSizeMultiplier: newMultiplier
        };
        onChange(JSON.stringify(content, null, 2));
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <ConfigEditor
                value={jsonInput}
                onChange={onChange}
                validateJson={(json) => {
                    if (Array.isArray(json)) return null; // Backward compatibility
                    if (typeof json !== 'object' || json === null) return "Content must be an object";
                    return null;
                }}
                renderUI={() => (
                    <div style={{ height: '100%', overflowY: 'auto', padding: '10px' }}>
                        <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Config</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ fontSize: '0.9em' }}>Base Font Size Multiplier:</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    value={fontSizeMultiplier}
                                    onChange={(e) => handleFontSizeChange(parseFloat(e.target.value))}
                                    style={{ width: '60px', padding: '4px' }}
                                />
                            </div>
                        </div>
                        <h3 style={{ margin: '0 0 15px 0', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>Edit Feedback</h3>
                        <UserFeedbackInput items={items} onChange={handleItemsChange} />
                    </div>
                )}
            />
            {error && <div style={{ color: 'red', padding: '10px' }}>{error}</div>}
        </div>
    );
};
