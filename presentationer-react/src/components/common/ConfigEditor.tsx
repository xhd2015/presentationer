import React, { useState } from 'react';
import { FiCode, FiList } from 'react-icons/fi';
import { PopupJsonEditor } from '../json/PopupJsonEditor';

export interface ConfigEditorProps {
    value: string;
    onChange: (value: string) => void;
    renderUI: () => React.ReactNode;
    // validateJson should return null/undefined if valid, or an error message string if invalid
    validateJson?: (json: any) => string | null | undefined;
    onModeChange?: (mode: 'normal' | 'json') => void;
}

export const ConfigEditor: React.FC<ConfigEditorProps> = ({ value, onChange, renderUI, validateJson, onModeChange }) => {
    const [mode, setMode] = useState<'normal' | 'json'>('normal');

    const handleModeSwitch = (newMode: 'normal' | 'json') => {
        if (newMode === 'normal') {
            try {
                const parsed = JSON.parse(value);
                if (validateJson) {
                    const error = validateJson(parsed);
                    if (error) {
                        alert(error);
                        return;
                    }
                }
                setMode('normal');
                onModeChange?.('normal');
            } catch (e) {
                alert("Invalid JSON, cannot switch to normal mode.");
            }
        } else {
            setMode('json');
            onModeChange?.('json');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <button
                    onClick={() => handleModeSwitch('normal')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '5px 10px', cursor: 'pointer',
                        backgroundColor: mode === 'normal' ? '#eef' : 'transparent',
                        border: '1px solid #ddd', borderRadius: '4px'
                    }}
                >
                    <FiList /> Normal
                </button>
                <button
                    onClick={() => handleModeSwitch('json')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '5px 10px', cursor: 'pointer',
                        backgroundColor: mode === 'json' ? '#eef' : 'transparent',
                        border: '1px solid #ddd', borderRadius: '4px'
                    }}
                >
                    <FiCode /> JSON
                </button>
            </div>

            {mode === 'json' ? (
                <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                    <PopupJsonEditor
                        value={value}
                        onChange={onChange}
                    />
                </div>
            ) : (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {renderUI()}
                </div>
            )}
        </div>
    );
};

