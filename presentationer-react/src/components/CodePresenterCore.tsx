import React from 'react';
import { CodeEditor } from './code-presenter/CodeEditor';
import { ConfigPanel, type ConfigItem } from './code-presenter/ConfigPanel';

export interface CodePresenterCoreProps {
    code: string;
    setCode: (code: string) => void;
    configList: ConfigItem[];
    setConfigList: (list: ConfigItem[]) => void;
    selectedConfigId: string | null;
    setSelectedConfigId: (id: string | null) => void;
    showHtml: boolean;
    setShowHtml: (show: boolean) => void;
    exportWidth: string;
    setExportWidth: (w: string) => void;
    exportHeight: string;
    setExportHeight: (h: string) => void;
    onExportPng?: () => void;
    onCopyPng?: () => void;
}

export const CodePresenterCore: React.FC<CodePresenterCoreProps> = ({
    code, setCode,
    configList, setConfigList,
    selectedConfigId, setSelectedConfigId,
    showHtml, setShowHtml,
    exportWidth, setExportWidth,
    exportHeight, setExportHeight,
    onExportPng, onCopyPng
}) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <CodeEditor code={code} onChange={setCode} />

            <ConfigPanel
                exportWidth={exportWidth}
                setExportWidth={setExportWidth}
                exportHeight={exportHeight}
                setExportHeight={setExportHeight}
                configList={configList}
                setConfigList={setConfigList}
                selectedConfigId={selectedConfigId}
                setSelectedConfigId={setSelectedConfigId}
                onExportPng={onExportPng}
                onCopyPng={onCopyPng}
                showHtml={showHtml}
                setShowHtml={setShowHtml}
            />
        </div>
    );
};

