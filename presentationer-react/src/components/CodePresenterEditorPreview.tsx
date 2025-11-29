import { useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { CodePresenterCore } from './CodePresenterCore';
import { PreviewPanel } from './code-presenter/PreviewPanel';
import { type ConfigItem } from './code-presenter/ConfigPanel';
import { parseLineConfig } from './code-presenter/focus';

export interface CodePresenterState {
    code: string;
    configList: ConfigItem[];
    selectedConfigId: string | null;
    exportWidth: string;
    exportHeight: string;
    showHtml: boolean;
}

export interface CodePresenterProps {
    initialState?: Partial<CodePresenterState>;
    onChange?: (state: CodePresenterState) => void;
}

export interface CodePresenterRef {
    getState: () => CodePresenterState;
}

const CodePresenterEditorPreview = forwardRef<CodePresenterRef, CodePresenterProps>(({ initialState, onChange }, ref) => {
    const [code, setCode] = useState<string>(initialState?.code || `package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, World!")\n}`);
    const [configList, setConfigList] = useState<ConfigItem[]>(initialState?.configList || []);
    const [selectedConfigId, setSelectedConfigId] = useState<string | null>(initialState?.selectedConfigId || null);
    const [showHtml, setShowHtml] = useState<boolean>(initialState?.showHtml || false);
    const [exportWidth, setExportWidth] = useState<string>(initialState?.exportWidth || '');
    const [exportHeight, setExportHeight] = useState<string>(initialState?.exportHeight || '');

    const state = {
        code,
        configList,
        selectedConfigId,
        exportWidth,
        exportHeight,
        showHtml
    };

    useEffect(() => {
        onChange?.(state);
    }, [code, configList, selectedConfigId, exportWidth, exportHeight, showHtml]);

    useImperativeHandle(ref, () => ({
        getState: () => state
    }));

    const previewRef = useRef<HTMLDivElement>(null!);

    const selectedConfig = configList.find(c => c.id === selectedConfigId);
    const focusLinesInput = selectedConfig ? selectedConfig.lines : '';
    const focusedLines = parseLineConfig(focusLinesInput);
    const isFocusMode = !!selectedConfigId;

    useEffect(() => {
        if (previewRef.current) {
            const { clientWidth, clientHeight } = previewRef.current;
            setExportWidth(clientWidth.toString());
            setExportHeight(clientHeight.toString());
        }
    }, [code, isFocusMode, focusedLines.length]);

    const handleDimensionsChange = useCallback((width: number, height: number) => {
        setExportWidth(width.toString());
        setExportHeight(height.toString());
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            <h2>Code Presenter</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <CodePresenterCore
                    code={code} setCode={setCode}
                    configList={configList} setConfigList={setConfigList}
                    selectedConfigId={selectedConfigId} setSelectedConfigId={setSelectedConfigId}
                    showHtml={showHtml} setShowHtml={setShowHtml}
                    exportWidth={exportWidth} setExportWidth={setExportWidth}
                    exportHeight={exportHeight} setExportHeight={setExportHeight}
                />

                <PreviewPanel
                    code={code}
                    isFocusMode={isFocusMode}
                    focusedLines={focusedLines}
                    showHtml={showHtml}
                    onDimensionsChange={handleDimensionsChange}
                    previewRef={previewRef}
                    exportWidth={exportWidth}
                    exportHeight={exportHeight}
                />
            </div>
        </div>
    );
});

CodePresenterEditorPreview.displayName = 'CodePresenterEditorPreview';

export default CodePresenterEditorPreview;

