import React from 'react';
import { PageKind, getAvatarUrl, listAvatars } from '../../api/session';
import type { Page } from '../../api/session';
import { pageRegistry } from './PageRegistry';
import type { PageDefinition } from './PageRegistry';
import { PreviewPanel } from '../code-presenter/PreviewPanel';
import { IMPreview } from '../im/IMPreview';
import { ChartPreview } from '../chart/ChartPreview';
import { RectanglePreview } from '../rectangle/RectanglePreview';
import { ConnectedRectanglesPreview } from '../connected-rectangles/ConnectedRectanglesPreview';
import { UserFeedbackPreview } from '../user-feedback/UserFeedbackPreview';
import { StructureBreakdownPreview } from '../structure/StructureBreakdownPreview';
import { parseLineConfig } from '../code-presenter/focus';

import { CodePresenterCore } from '../CodePresenterCore';
import { IMEditorCore } from '../im/IMEditorCore';
import { ChartEditorCore } from '../chart/ChartEditorCore';
import { RectangleEditorCore } from '../rectangle/RectangleEditorCore';
import { ConnectedRectanglesEditorCore } from '../connected-rectangles/ConnectedRectanglesEditorCore';
import { UserFeedbackEditorCore } from '../user-feedback/UserFeedbackEditorCore';
import { StructureBreakdownEditorCore } from '../structure/StructureBreakdownEditorCore';
import type { CodePresenterState } from '../CodePresenterEditorPreview';

// --- Helpers ---

const getStandardExportDimensions = (page: Page) => {
    if (page.content && typeof page.content !== 'string') {
        return {
            width: (page.content as any).exportWidth,
            height: (page.content as any).exportHeight
        };
    }
    return undefined;
};

const getJsonContent = (page: Page, defaultJson = '{}') => {
    if (typeof page.content === 'string') return page.content;
    const json = (page.content as any)?.json;
    if (json !== undefined) return json;
    return defaultJson;
};

const handleJsonChange = (page: Page, onPageUpdate: (id: string, content: any) => void, val: string) => {
    onPageUpdate(page.id, (prevContent: any) => {
        if (typeof prevContent === 'object' && prevContent !== null) {
            return { ...prevContent, json: val };
        } else {
            return { json: val };
        }
    });
};

const validateJsonContent = (page: Page, expectedType: 'array' | 'object') => {
    try {
        const content = page.content;
        const val = typeof content === 'string' ? content : (content as any)?.json;
        if (!val) return null;
        const parsed = JSON.parse(val);
        if (expectedType === 'array' && !Array.isArray(parsed)) return "Input must be a JSON array.";
        if (expectedType === 'object' && (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null)) return "Input must be a JSON object.";
        return null;
    } catch (e: any) {
        return e.message;
    }
};

// --- Page Definitions ---

// Code Page
const CodePage: PageDefinition = {
    kind: PageKind.Code,
    label: 'Code Presenter',
    getPreviewTitle: () => 'Preview:',
    getPreviewStyle: () => ({ backgroundColor: '#1e1e1e' }),
    getExportDimensions: getStandardExportDimensions,
    renderPreview: ({ page }) => {
        const content = page.content as any || {};
        const configList = content.configList || [];
        const selectedConfig = configList.find((c: any) => c.id === content.selectedConfigId);
        return (
            <PreviewPanel
                code={content.code || ''}
                language={content.language}
                isFocusMode={!!content.selectedConfigId}
                focusedLines={parseLineConfig(selectedConfig?.lines || '')}
            />
        );
    },
    renderEditor: ({ page, onPageUpdate }) => {
        const codeState = (page.content || {}) as CodePresenterState;
        const updateCodeState = (partial: Partial<CodePresenterState>) => {
            onPageUpdate(page.id, (prevContent: any) => {
                const prevState = (prevContent || {}) as CodePresenterState;
                return { ...prevState, ...partial };
            });
        };
        return (
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
        );
    }
};

// Chat Thread Page
const ChatThreadPage: PageDefinition = {
    kind: PageKind.ChatThread,
    label: 'Chat Thread',
    getPreviewTitle: () => 'Preview',
    getPreviewStyle: () => undefined,
    getExportDimensions: getStandardExportDimensions,
    validateContent: (page) => validateJsonContent(page, 'array'),
    renderPreview: ({ page, resolveAvatarUrl }) => (
        <IMPreview
            key={page.id}
            jsonInput={typeof page.content === 'string' ? page.content : (page.content as any)?.json || ''}
            onResolveAvatarUrl={resolveAvatarUrl || ((name) => name)}
        />
    ),
    renderEditor: ({ page, onPageUpdate, sessionName, error }) => (
        <IMEditorCore
            jsonInput={getJsonContent(page, '[]')}
            onChange={(val) => handleJsonChange(page, onPageUpdate, val)}
            onResolveAvatarUrl={(name) => getAvatarUrl(sessionName, name)}
            onListAvatars={() => listAvatars(sessionName).catch(() => [])}
            error={error}
        />
    )
};

// Chart Page
const ChartPage: PageDefinition = {
    kind: PageKind.Chart,
    label: 'Chart',
    getPreviewTitle: (page) => {
        const chartType = (page.content as any)?.chartType || 'line';
        return `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`;
    },
    getPreviewStyle: () => ({ padding: '20px', height: 'auto' }),
    getExportDimensions: getStandardExportDimensions,
    validateContent: (page) => validateJsonContent(page, 'array'),
    renderPreview: ({ page }) => {
        const content = page.content as any || {};
        const width = content.exportWidth;
        const height = content.exportHeight;
        return (
            <ChartPreview
                key={`${page.id}-${content.refreshKey || 0}`}
                jsonInput={typeof page.content === 'string' ? page.content : content.json || ''}
                chartType={content.chartType || 'line'}
                exportWidth={width}
                exportHeight={height}
            />
        );
    },
    renderEditor: ({ page, onPageUpdate, error }) => {
        const content = page.content as any || {};
        const handleChartChange = (json: string, type: 'line' | 'bar' | 'pie') => {
            onPageUpdate(page.id, (prevContent: any) => {
                const prevObj = (typeof prevContent === 'object' && prevContent) ? prevContent : {};
                return { ...prevObj, json, chartType: type };
            });
        };
        const handleChartRefresh = () => {
            onPageUpdate(page.id, (prevContent: any) => {
                const prevObj = (typeof prevContent === 'object' && prevContent) ? prevContent : {};
                return { ...prevObj, refreshKey: (prevObj.refreshKey || 0) + 1 };
            });
        };
        return (
            <ChartEditorCore
                jsonInput={getJsonContent(page, '[]')}
                chartType={content.chartType || 'line'}
                onChange={handleChartChange}
                onRefresh={handleChartRefresh}
                error={error}
            />
        );
    }
};

const standardPreviewStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '4px',
    backgroundColor: '#ffffff',
    minHeight: '100%'
};

// Rectangle Page
const RectanglePage: PageDefinition = {
    kind: PageKind.Rectangle,
    label: 'Rectangle',
    getPreviewTitle: () => 'Rectangle',
    getPreviewStyle: () => standardPreviewStyle,
    getExportDimensions: getStandardExportDimensions,
    validateContent: (page) => validateJsonContent(page, 'object'),
    renderPreview: ({ page }) => (
        <RectanglePreview
            key={page.id}
            jsonInput={typeof page.content === 'string' ? page.content : (page.content as any)?.json || ''}
        />
    ),
    renderEditor: ({ page, onPageUpdate, error }) => (
        <RectangleEditorCore
            jsonInput={getJsonContent(page, '{}')}
            onChange={(val) => handleJsonChange(page, onPageUpdate, val)}
            error={error}
        />
    )
};

// Connected Rectangles Page
const ConnectedRectanglesPage: PageDefinition = {
    kind: PageKind.ConnectedRectangles,
    label: 'Connected Rectangles',
    getPreviewTitle: () => 'Connected Rectangles',
    getPreviewStyle: () => standardPreviewStyle,
    getExportDimensions: getStandardExportDimensions,
    validateContent: (page) => validateJsonContent(page, 'object'),
    renderPreview: ({ page }) => (
        <ConnectedRectanglesPreview
            key={page.id}
            jsonInput={typeof page.content === 'string' ? page.content : (page.content as any)?.json || ''}
        />
    ),
    renderEditor: ({ page, onPageUpdate, error }) => (
        <ConnectedRectanglesEditorCore
            jsonInput={getJsonContent(page, '{}')}
            onChange={(val) => handleJsonChange(page, onPageUpdate, val)}
            error={error}
        />
    )
};

// User Feedback Page
const UserFeedbackPage: PageDefinition = {
    kind: PageKind.UserFeedback,
    label: 'User Feedback',
    getPreviewTitle: () => 'User Feedback',
    getPreviewStyle: () => standardPreviewStyle,
    getExportDimensions: getStandardExportDimensions,
    validateContent: (page) => validateJsonContent(page, 'object'),
    renderPreview: ({ page }) => {
        const getItems = () => {
            try {
                const json = typeof page.content === 'string' ? page.content : (page.content as any)?.json || '{}';
                const parsed = JSON.parse(json);
                return Array.isArray(parsed) ? parsed : (parsed.items || []);
            } catch (e) { return []; }
        };
        const getFontSize = () => {
            try {
                const json = typeof page.content === 'string' ? page.content : (page.content as any)?.json || '{}';
                const parsed = JSON.parse(json);
                return Array.isArray(parsed) ? 1 : (parsed.fontSizeMultiplier || 1);
            } catch (e) { return 1; }
        };

        return (
            <UserFeedbackPreview
                items={getItems()}
                fontSizeMultiplier={getFontSize()}
            />
        );
    },
    renderEditor: ({ page, onPageUpdate, error }) => (
        <UserFeedbackEditorCore
            jsonInput={getJsonContent(page, '{}')}
            onChange={(val) => handleJsonChange(page, onPageUpdate, val)}
            error={error}
        />
    )
};

// Structure Breakdown Page
const StructureBreakdownPage: PageDefinition = {
    kind: PageKind.StructureBreakdown,
    label: 'Structure Breakdown',
    getPreviewTitle: () => 'Structure Breakdown',
    getPreviewStyle: () => ({ padding: '20px', backgroundColor: '#1e1e1e', minHeight: '100%', overflow: 'auto' }),
    getExportDimensions: getStandardExportDimensions,
    validateContent: (page) => validateJsonContent(page, 'object'),
    renderPreview: ({ page }) => {
        const content = (() => {
            try {
                const json = typeof page.content === 'string' ? page.content : (page.content as any)?.json || '{}';
                return JSON.parse(json);
            } catch (e) { return {}; }
        })();
        return (
            <StructureBreakdownPreview
                items={content.items || []}
                columns={content.columns}
            />
        );
    },
    renderEditor: ({ page, onPageUpdate, error }) => (
        <StructureBreakdownEditorCore
            jsonInput={getJsonContent(page, '{}')}
            onChange={(val) => handleJsonChange(page, onPageUpdate, val)}
            error={error}
        />
    )
};

// Register all
function registerStandardPages() {
    pageRegistry.register(CodePage);
    pageRegistry.register(ChatThreadPage);
    pageRegistry.register(ChartPage);
    pageRegistry.register(RectanglePage);
    pageRegistry.register(ConnectedRectanglesPage);
    pageRegistry.register(UserFeedbackPage);
    pageRegistry.register(StructureBreakdownPage);
}

// Execute registration
registerStandardPages();
