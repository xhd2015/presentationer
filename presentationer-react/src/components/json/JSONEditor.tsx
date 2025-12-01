import React from 'react';
import Editor from '@monaco-editor/react';

interface JSONEditorProps {
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
    height?: string | number;
}

export const JSONEditor: React.FC<JSONEditorProps> = ({ value, onChange, readOnly, height = '100%' }) => {
    const handleEditorChange = (value: string | undefined) => {
        onChange(value || '');
    };

    return (
        <Editor
            height={height}
            defaultLanguage="json"
            value={value}
            onChange={handleEditorChange}
            options={{
                readOnly,
                minimap: { enabled: false },
                automaticLayout: true,
                formatOnPaste: true,
                formatOnType: true,
                scrollBeyondLastLine: false,
                tabSize: 2,
            }}
        />
    );
};

