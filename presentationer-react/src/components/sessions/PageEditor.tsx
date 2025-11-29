import React, { useEffect, useState } from 'react';
import { CodePresenterCore } from '../CodePresenterCore';
import { IMEditorCore } from '../im/IMEditorCore';
import type { CodePresenterState } from '../CodePresenterEditorPreview';
import { type Page, getAvatarUrl, listAvatars } from '../../api/session';

interface PageEditorProps {
    sessionName: string;
    page: Page;
    onPageUpdate?: (pageId: string, content: any) => void;
}

export const PageEditor: React.FC<PageEditorProps> = ({
    sessionName,
    page,
    onPageUpdate
}) => {
    const [imError, setImError] = useState<string | null>(null);

    const handleResolveAvatarUrl = (avatarName: string) => {
        return getAvatarUrl(sessionName, avatarName);
    };

    const handleListAvatars = async () => {
        try {
            return await listAvatars(sessionName);
        } catch (e) {
            console.error("Failed to list avatars", e);
            return [];
        }
    };

    // Validate IM content
    useEffect(() => {
        if (page.kind === 'chat_thread') {
            try {
                const val = page.content as string;
                if (!val) {
                    setImError(null);
                    return;
                }
                const parsed = JSON.parse(val);
                if (!Array.isArray(parsed)) throw new Error("Input must be a JSON array.");
                setImError(null);
            } catch (e: any) {
                setImError(e.message);
            }
        }
    }, [page.content, page.kind]);

    // Code State Helpers
    const codeState = (page.content || {}) as CodePresenterState;
    const updateCodeState = (partial: Partial<CodePresenterState>) => {
        onPageUpdate?.(page.id, { ...codeState, ...partial });
    };

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {page.kind === 'code' && (
                <CodePresenterCore
                    code={codeState.code || ''}
                    setCode={code => updateCodeState({ code })}
                    configList={codeState.configList || []}
                    setConfigList={list => updateCodeState({ configList: list })}
                    selectedConfigId={codeState.selectedConfigId || null}
                    setSelectedConfigId={id => updateCodeState({ selectedConfigId: id })}
                    showHtml={codeState.showHtml || false}
                    setShowHtml={show => updateCodeState({ showHtml: show })}
                    exportWidth={codeState.exportWidth || ''}
                    setExportWidth={w => updateCodeState({ exportWidth: w })}
                    exportHeight={codeState.exportHeight || ''}
                    setExportHeight={h => updateCodeState({ exportHeight: h })}
                />
            )}
            {page.kind === 'chat_thread' && (
                <IMEditorCore
                    jsonInput={page.content as string || ''}
                    onChange={(val) => onPageUpdate?.(page.id, val)}
                    onResolveAvatarUrl={handleResolveAvatarUrl}
                    onListAvatars={handleListAvatars}
                    error={imError}
                />
            )}
        </div>
    );
};
