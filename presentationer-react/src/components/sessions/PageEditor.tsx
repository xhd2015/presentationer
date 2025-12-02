import React, { useEffect, useState, useCallback } from 'react';
import { CodePresenterCore } from '../CodePresenterCore';
import { IMEditorCore } from '../im/IMEditorCore';
import { ChartEditorCore } from '../chart/ChartEditorCore';
import { RectangleEditorCore } from '../rectangle/RectangleEditorCore';
import { ConnectedRectanglesEditorCore } from '../connected-rectangles/ConnectedRectanglesEditorCore';
import { UserFeedbackEditorCore } from '../user-feedback/UserFeedbackEditorCore';
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
    const [rectError, setRectError] = useState<string | null>(null);
    const [connRectError, setConnRectError] = useState<string | null>(null);
    const [userFeedbackError, setUserFeedbackError] = useState<string | null>(null);

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

    const validateContent = useCallback((p: Page, expectedType: 'array' | 'object') => {
        try {
            const content = p.content;
            const val = typeof content === 'string' ? content : (content as any)?.json;
            if (!val) return null;
            const parsed = JSON.parse(val);
            if (expectedType === 'array' && !Array.isArray(parsed)) return "Input must be a JSON array.";
            if (expectedType === 'object' && (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null)) return "Input must be a JSON object.";
            return null;
        } catch (e: any) {
            return e.message;
        }
    }, []);

    // Validate Content
    useEffect(() => {
        if (page.kind === PageKind.ChatThread) {
            setImError(validateContent(page, 'array'));
        } else if (page.kind === PageKind.Chart) {
            setChartError(validateContent(page, 'array'));
        } else if (page.kind === PageKind.Rectangle) {
            setRectError(validateContent(page, 'object'));
        } else if (page.kind === PageKind.ConnectedRectangles) {
            setConnRectError(validateContent(page, 'object'));
        } else if (page.kind === PageKind.UserFeedback) {
            setUserFeedbackError(validateContent(page, 'object'));
        }
    }, [page.content, page.kind, validateContent]);

    // Code State Helpers
    const codeState = (page.content || {}) as CodePresenterState;
    const updateCodeState = (partial: Partial<CodePresenterState>) => {
        onPageUpdate?.(page.id, (prevContent: any) => {
            const prevState = (prevContent || {}) as CodePresenterState;
            return { ...prevState, ...partial };
        });
    };

    const getJsonContent = () => {
        if (typeof page.content === 'string') return page.content;
        const json = (page.content as any)?.json;
        if (json !== undefined) return json;

        if (page.kind === PageKind.ChatThread || page.kind === PageKind.Chart) return '[]';
        if (page.kind === PageKind.UserFeedback) return '{}';
        if (page.kind === PageKind.Rectangle || page.kind === PageKind.ConnectedRectangles) return '{}';
        return '';
    };

    const handleJsonChange = (val: string) => {
        if (!onPageUpdate) return;

        onPageUpdate(page.id, (prevContent: any) => {
            if (typeof prevContent === 'object' && prevContent !== null) {
                return { ...prevContent, json: val };
            } else {
                return { json: val };
            }
        });
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
                    jsonInput={getJsonContent()}
                    onChange={handleJsonChange}
                    onResolveAvatarUrl={handleResolveAvatarUrl}
                    onListAvatars={handleListAvatars}
                    error={imError}
                />
            )}
            {page.kind === PageKind.Chart && (
                <ChartEditorCore
                    jsonInput={getJsonContent()}
                    chartType={getChartType()}
                    onChange={handleChartChange}
                    onRefresh={handleChartRefresh}
                    error={chartError}
                />
            )}
            {page.kind === PageKind.Rectangle && (
                <RectangleEditorCore
                    jsonInput={getJsonContent()}
                    onChange={handleJsonChange}
                    error={rectError}
                />
            )}
            {page.kind === PageKind.ConnectedRectangles && (
                <ConnectedRectanglesEditorCore
                    jsonInput={getJsonContent()}
                    onChange={handleJsonChange}
                    error={connRectError}
                />
            )}
            {page.kind === PageKind.UserFeedback && (
                <UserFeedbackEditorCore
                    jsonInput={getJsonContent()}
                    onChange={handleJsonChange}
                    error={userFeedbackError}
                />
            )}
        </div>
    );
};
