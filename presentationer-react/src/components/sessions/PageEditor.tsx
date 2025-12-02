import React, { useEffect, useState } from 'react';
import { type Page } from '../../api/session';
import { pageRegistry } from './PageRegistry';
import './StandardPages';

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
    const [error, setError] = useState<string | null>(null);
    const pageDef = pageRegistry.get(page.kind);

    useEffect(() => {
        if (pageDef?.validateContent) {
            setError(pageDef.validateContent(page));
        } else {
            setError(null);
        }
    }, [page, pageDef]);

    if (!pageDef) {
        return <div style={{ padding: '20px', color: '#888' }}>Unknown page kind: {page.kind}</div>;
    }

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {pageDef.renderEditor({
                page,
                sessionName,
                onPageUpdate: onPageUpdate || (() => { }),
                error
            })}
        </div>
    );
};
