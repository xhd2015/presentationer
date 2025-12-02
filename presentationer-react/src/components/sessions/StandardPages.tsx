import React from 'react';
import { PageKind } from '../../api/session';
import type { Page } from '../../api/session';
import { pageRegistry } from './PageRegistry';
import type { PageDefinition } from './PageRegistry';
import { PreviewPanel } from '../code-presenter/PreviewPanel';
import { IMPreview } from '../im/IMPreview';
import { ChartPreview } from '../chart/ChartPreview';
import { RectanglePreview } from '../rectangle/RectanglePreview';
import { ConnectedRectanglesPreview } from '../connected-rectangles/ConnectedRectanglesPreview';
import { UserFeedbackPreview } from '../user-feedback/UserFeedbackPreview';
import { parseLineConfig } from '../code-presenter/focus';

// Helper to extract dims
const getStandardExportDimensions = (page: Page) => {
    if (page.content && typeof page.content !== 'string') {
        return {
            width: (page.content as any).exportWidth,
            height: (page.content as any).exportHeight
        };
    }
    return undefined;
};

// Code Page
const CodePage: PageDefinition = {
    kind: PageKind.Code,
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
    }
};

// Chat Thread Page
const ChatThreadPage: PageDefinition = {
    kind: PageKind.ChatThread,
    getPreviewTitle: () => 'Preview',
    getPreviewStyle: () => undefined,
    getExportDimensions: getStandardExportDimensions,
    renderPreview: ({ page, resolveAvatarUrl }) => (
        <IMPreview
            key={page.id}
            jsonInput={typeof page.content === 'string' ? page.content : (page.content as any)?.json || ''}
            onResolveAvatarUrl={resolveAvatarUrl || ((name) => name)}
        />
    )
};

// Chart Page
const ChartPage: PageDefinition = {
    kind: PageKind.Chart,
    getPreviewTitle: (page) => {
        const chartType = (page.content as any)?.chartType || 'line';
        return `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`;
    },
    getPreviewStyle: () => ({ padding: '20px', height: 'auto' }),
    getExportDimensions: getStandardExportDimensions,
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
    getPreviewTitle: () => 'Rectangle',
    getPreviewStyle: () => standardPreviewStyle,
    getExportDimensions: getStandardExportDimensions,
    renderPreview: ({ page }) => (
        <RectanglePreview
            key={page.id}
            jsonInput={typeof page.content === 'string' ? page.content : (page.content as any)?.json || ''}
        />
    )
};

// Connected Rectangles Page
const ConnectedRectanglesPage: PageDefinition = {
    kind: PageKind.ConnectedRectangles,
    getPreviewTitle: () => 'Connected Rectangles',
    getPreviewStyle: () => standardPreviewStyle,
    getExportDimensions: getStandardExportDimensions,
    renderPreview: ({ page }) => (
        <ConnectedRectanglesPreview
            key={page.id}
            jsonInput={typeof page.content === 'string' ? page.content : (page.content as any)?.json || ''}
        />
    )
};

// User Feedback Page
const UserFeedbackPage: PageDefinition = {
    kind: PageKind.UserFeedback,
    getPreviewTitle: () => 'User Feedback',
    getPreviewStyle: () => standardPreviewStyle,
    getExportDimensions: getStandardExportDimensions,
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
    }
};

// Register all
export function registerStandardPages() {
    pageRegistry.register(CodePage);
    pageRegistry.register(ChatThreadPage);
    pageRegistry.register(ChartPage);
    pageRegistry.register(RectanglePage);
    pageRegistry.register(ConnectedRectanglesPage);
    pageRegistry.register(UserFeedbackPage);
}
