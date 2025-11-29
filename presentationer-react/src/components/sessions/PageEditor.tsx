import React, { useEffect, useState, useCallback } from 'react';
import { CodePresenterCore } from '../CodePresenterCore';
import { IMEditorCore } from '../im/IMEditorCore';
import { ChartEditorCore } from '../chart/ChartEditorCore';
import type { CodePresenterState } from '../CodePresenterEditorPreview';
import { type Page, getAvatarUrl, listAvatars, PageKind } from '../../api/session';

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
    const [chartError, setChartError] = useState<string | null>(null);

    const handleResolveAvatarUrl = useCallback((avatarName: string) => {
        return getAvatarUrl(sessionName, avatarName);
    }, [sessionName]);

    const handleListAvatars = useCallback(async () => {
        try {
            return await listAvatars(sessionName);
        } catch (e) {
            console.error("Failed to list avatars", e);
            return [];
        }
    }, [sessionName]);

    // Validate IM content
    useEffect(() => {
        if (page.kind === PageKind.ChatThread) {
            try {
                const content = page.content;
                const val = typeof content === 'string' ? content : (content as any).json;
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
        } else if (page.kind === PageKind.Chart) {
            try {
                const content = page.content;
                const val = typeof content === 'string' ? content : (content as any).json;
                if (!val) {
                    setChartError(null);
                    return;
                }
                const parsed = JSON.parse(val);
                if (!Array.isArray(parsed)) throw new Error("Input must be a JSON array.");
                setChartError(null);
            } catch (e: any) {
                setChartError(e.message);
            }
        }
    }, [page.content, page.kind]);

    // Code State Helpers
    const codeState = (page.content || {}) as CodePresenterState;
    const updateCodeState = (partial: Partial<CodePresenterState>) => {
        onPageUpdate?.(page.id, (prevContent: any) => {
            const prevState = (prevContent || {}) as CodePresenterState;
            return { ...prevState, ...partial };
        });
    };

    const getIMJson = () => {
        if (typeof page.content === 'string') return page.content;
        return (page.content as any)?.json || '';
    };

    const handleIMChange = (val: string) => {
        if (!onPageUpdate) return;

        onPageUpdate(page.id, (prevContent: any) => {
            if (typeof prevContent === 'object' && prevContent !== null) {
                return { ...prevContent, json: val };
            } else {
                return val;
            }
        });
    };

    const getChartJson = () => {
        if (typeof page.content === 'string') return page.content;
        return (page.content as any)?.json || '';
    };

    const getChartType = () => {
        return (page.content as any)?.chartType || 'line';
    };

    const handleChartChange = (json: string, type: 'line' | 'bar' | 'pie') => {
        if (!onPageUpdate) return;
        onPageUpdate(page.id, (prevContent: any) => {
            const prevObj = (typeof prevContent === 'object' && prevContent) ? prevContent : {};
            return { ...prevObj, json, chartType: type };
        });
    };

    const handleChartRefresh = () => {
        if (!onPageUpdate) return;
        onPageUpdate(page.id, (prevContent: any) => {
            const prevObj = (typeof prevContent === 'object' && prevContent) ? prevContent : {};
            return { ...prevObj, refreshKey: (prevObj.refreshKey || 0) + 1 };
        });
    };

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {page.kind === PageKind.Code && (
                <CodePresenterCore
                    code={codeState.code || ''}
                    setCode={code => updateCodeState({ code })}
                    language={codeState.language || 'go'}
                    setLanguage={lang => updateCodeState({ language: lang })}
                    configList={codeState.configList || []}
                    setConfigList={list => updateCodeState({ configList: list })}
                    selectedConfigId={codeState.selectedConfigId || null}
                    setSelectedConfigId={id => updateCodeState({ selectedConfigId: id })}
                    showHtml={codeState.showHtml || false}
                    setShowHtml={show => updateCodeState({ showHtml: show })}
                />
            )}
            {page.kind === PageKind.ChatThread && (
                <IMEditorCore
                    jsonInput={getIMJson()}
                    onChange={handleIMChange}
                    onResolveAvatarUrl={handleResolveAvatarUrl}
                    onListAvatars={handleListAvatars}
                    error={imError}
                />
            )}
            {page.kind === PageKind.Chart && (
                <ChartEditorCore
                    jsonInput={getChartJson()}
                    chartType={getChartType()}
                    onChange={handleChartChange}
                    onRefresh={handleChartRefresh}
                    error={chartError}
                />
            )}
        </div>
    );
};
