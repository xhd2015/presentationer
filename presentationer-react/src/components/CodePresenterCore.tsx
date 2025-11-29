import React from 'react';
import { CodeEditor } from './code-presenter/CodeEditor';
import { ConfigPanel, type ConfigItem } from './code-presenter/ConfigPanel';

export interface CodePresenterCoreProps {
    code: string;
    setCode: (code: string) => void;
    language?: string;
    setLanguage?: (lang: string) => void;
    configList: ConfigItem[];
    setConfigList: (list: ConfigItem[]) => void;
    selectedConfigId: string | null;
    setSelectedConfigId: (id: string | null) => void;
    showHtml: boolean;
    setShowHtml: (show: boolean) => void;
}

export const CodePresenterCore: React.FC<CodePresenterCoreProps> = ({
    code, setCode,
    language, setLanguage,
    configList, setConfigList,
    selectedConfigId, setSelectedConfigId,
    showHtml, setShowHtml
}) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <CodeEditor code={code} onChange={setCode} language={language} />

            <ConfigPanel
                configList={configList}
                setConfigList={setConfigList}
                selectedConfigId={selectedConfigId}
                setSelectedConfigId={setSelectedConfigId}
                language={language}
                setLanguage={setLanguage}
                showHtml={showHtml}
                setShowHtml={setShowHtml}
            />
        </div>
    );
};

