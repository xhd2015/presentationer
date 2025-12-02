import React from 'react';
import type { Page } from '../../api/session';
import { PageKind } from '../../api/session';

export interface PageRendererProps {
    page: Page;
    resolveAvatarUrl?: (name: string) => string;
    onDimensionsChange?: (w: number, h: number) => void;
    previewRef?: React.RefObject<HTMLDivElement | null>;
}

export interface PageEditorContext {
    page: Page;
    sessionName: string;
    onPageUpdate: (pageId: string, content: any) => void;
    error: string | null;
}

export interface PageDefinition {
    kind: PageKind;
    label: string;
    getPreviewTitle: (page: Page) => string;
    getPreviewStyle: (page: Page) => React.CSSProperties | undefined;
    renderPreview: (props: PageRendererProps) => React.ReactNode;
    renderEditor: (props: PageEditorContext) => React.ReactNode;
    validateContent?: (page: Page) => string | null;
    getExportDimensions: (page: Page) => { width?: string; height?: string } | undefined;
}

class PageRegistry {
    private definitions: Map<PageKind, PageDefinition> = new Map();

    register(definition: PageDefinition) {
        this.definitions.set(definition.kind, definition);
    }

    get(kind: PageKind): PageDefinition | undefined {
        return this.definitions.get(kind);
    }

    getAll(): PageDefinition[] {
        return Array.from(this.definitions.values());
    }
}

export const pageRegistry = new PageRegistry();
