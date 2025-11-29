import React from 'react';
import { CodeEditor } from './code-presenter/CodeEditor';
import { ConfigPanel, type ConfigItem, SUPPORTED_LANGUAGES } from './code-presenter/ConfigPanel';

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
            {setLanguage && (
                <div style={{ marginBottom: '0px' }}>
                    <label>
                        <strong>Language: </strong>
                        <select
                            value={language || 'go'}
                            onChange={(e) => setLanguage(e.target.value)}
                            style={{ marginLeft: '5px', padding: '4px', borderRadius: '4px' }}
                        >
                            {SUPPORTED_LANGUAGES.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    </label>
                </div>
            )}
            <CodeEditor code={code} onChange={setCode} language={language} />

            <ConfigPanel
                configList={configList}
                setConfigList={setConfigList}
                selectedConfigId={selectedConfigId}
                setSelectedConfigId={setSelectedConfigId}
                showHtml={showHtml}
                setShowHtml={setShowHtml}
            />
        </div>
    );
};

