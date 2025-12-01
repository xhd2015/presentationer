import React, { useState, useRef, useEffect } from 'react';
import { FiCode, FiList, FiHelpCircle } from 'react-icons/fi';
import { PopupJsonEditor } from '../json/PopupJsonEditor';

export interface ConfigEditorProps {
    value: string;
    onChange: (value: string) => void;
    renderUI: () => React.ReactNode;
    // validateJson should return null/undefined if valid, or an error message string if invalid
    validateJson?: (json: any) => string | null | undefined;
    onModeChange?: (mode: 'normal' | 'json') => void;
    schema?: any;
    helpText?: React.ReactNode;
}

export const ConfigEditor: React.FC<ConfigEditorProps> = ({
    value,
    onChange,
    renderUI,
    validateJson,
    onModeChange,
    schema,
    helpText
}) => {
    const [mode, setMode] = useState<'normal' | 'json'>('normal');
    const [showHelp, setShowHelp] = useState(false);
    const helpRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
                setShowHelp(false);
            }
        };

        if (showHelp) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showHelp]);

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
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px', alignItems: 'center' }}>
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

                {mode === 'json' && helpText && (
                    <div
                        ref={helpRef}
                        style={{ position: 'relative', marginLeft: 'auto', display: 'flex', alignItems: 'center' }}
                    >
                        <FiHelpCircle
                            size={20}
                            color={showHelp ? "#333" : "#666"}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setShowHelp(!showHelp)}
                            title="Show Help"
                        />
                        {showHelp && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                width: '400px',
                                maxHeight: '500px',
                                overflowY: 'auto',
                                background: 'white',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                padding: '15px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                                fontSize: '13px',
                                color: '#333',
                                zIndex: 100,
                                marginTop: '5px'
                            }}>
                                {helpText}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {mode === 'json' ? (
                <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                    <PopupJsonEditor
                        value={value}
                        onChange={onChange}
                        schema={schema}
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
