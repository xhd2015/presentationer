import React, { useState, useEffect, useMemo } from 'react';
import Editor, { type Monaco } from '@monaco-editor/react';

interface JSONEditorProps {
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
    height?: string | number;
    schema?: any;
}

// Global registry to avoid overwriting schemas when multiple editors are present
const registeredSchemas: any[] = [];

export const JSONEditor: React.FC<JSONEditorProps> = ({
    value,
    onChange,
    readOnly,
    height = '100%',
    schema
}) => {
    const [localValue, setLocalValue] = useState(value);

    // Unique path for this editor instance
    const editorPath = useMemo(() => `json-editor-${Math.random().toString(36).substr(2, 9)}.json`, []);

    useEffect(() => {
        if (value !== localValue) {
            setLocalValue(value);
        }
    }, [value]);

    const handleEditorChange = (newValue: string | undefined) => {
        const val = newValue || '';
        setLocalValue(val);
        onChange(val);
    };

    const handleEditorDidMount = (_editor: any, monaco: Monaco) => {
        if (schema) {
            const schemaUri = `http://myserver/schema-${editorPath}`;

            // Check if schema already registered (e.g. remount)
            const existingIndex = registeredSchemas.findIndex(s => s.uri === schemaUri);
            if (existingIndex === -1) {
                registeredSchemas.push({
                    uri: schemaUri,
                    fileMatch: [editorPath], // Match by path
                    schema: schema
                });
            }

            monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: true,
                schemas: registeredSchemas
            });
        }
    };

    return (
        <div style={{ position: 'relative', height }}>
            <Editor
                height="100%"
                defaultLanguage="json"
                path={editorPath}
                value={localValue}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
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
        </div>
    );
};
