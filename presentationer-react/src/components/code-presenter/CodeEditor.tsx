import React from 'react';

interface CodeEditorProps {
    code: string;
    onChange: (newCode: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
    return (
        <label>
            <strong>Code Input (Go):</strong>
            <textarea
                value={code}
                onChange={(e) => onChange(e.target.value)}
                rows={15}
                style={{
                    width: '100%',
                    fontFamily: 'monospace',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                }}
            />
        </label>
    );
};

