import React, { useState, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { PageListSidebar } from './PageListSidebar';
import { SessionDetailProvider, useSessionDetailContext } from '../../context/SessionDetailContext';
import { CreatePageModal } from './CreatePageModal';
import { getAvatarUrl, PageKind } from '../../api/session';
import { ResizableSplitPane } from '../common/ResizableSplitPane';
import { PreviewControls } from '../common/PreviewControls';
import { PreviewContainer } from '../common/PreviewContainer';
import { pageRegistry } from './PageRegistry';
import './StandardPages';

const SessionDetailContent: React.FC = () => {
    const { pages, createPage, deletePage, sessionName, saveSession, renamePage, updatePageContent, duplicatePage } = useSessionDetailContext();
    const { pageTitle } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);
    // Force update for HTML preview
    const [, forceUpdate] = useState({});

    const decodedPageTitle = pageTitle ? decodeURIComponent(pageTitle) : undefined;
    const isSettings = location.pathname.endsWith('/settings');
    const selectedPage = pages.find(p => p.title === decodedPageTitle);
    const pageId = selectedPage?.id;
    const showPreview = !isSettings && !!selectedPage;

    const pageDef = selectedPage ? pageRegistry.get(selectedPage.kind) : undefined;

    // Extract dims
    const dims = (selectedPage && pageDef && pageDef.getExportDimensions)
        ? pageDef.getExportDimensions(selectedPage)
        : undefined;
    const exportWidth = dims?.width;
    const exportHeight = dims?.height;

    const handleDimsChange = useCallback((w: string | undefined, h: string | undefined) => {
        if (!selectedPage) return;
        let newContent = selectedPage.content;

        // Ensure content is object (legacy string support)
        if (typeof newContent === 'string' && selectedPage.kind !== PageKind.Code) {
            newContent = { json: newContent };
        }

        const updatedContent = { ...(newContent as any) };
        let changed = false;
        if (w !== undefined && updatedContent.exportWidth !== w) {
            updatedContent.exportWidth = w;
            changed = true;
        }
        if (h !== undefined && updatedContent.exportHeight !== h) {
            updatedContent.exportHeight = h;
            changed = true;
        }

        if (changed) {
            updatePageContent(selectedPage.id, updatedContent);
        }
    }, [selectedPage, updatePageContent]);

    const handleGenericDimensionsChange = useCallback((w: number, h: number) => {
        handleDimsChange(w.toString(), h.toString());
    }, [handleDimsChange]);

    const handleSelectPage = (id: string) => {
        const page = pages.find(p => p.id === id);
        if (page) {
            navigate(`/sessions/${sessionName}/pages/${encodeURIComponent(page.title)}`);
        }
    };

    const handleSettingsClick = () => {
        navigate(`/sessions/${sessionName}/settings`);
    };

    const handleDeletePage = async (id: string) => {
        await deletePage(id);
        if (pageId === id) {
            const remaining = pages.filter(p => p.id !== id);
            if (remaining.length > 0) {
                navigate(`/sessions/${sessionName}/pages/${encodeURIComponent(remaining[0].title)}`);
            } else {
                navigate(`/sessions/${sessionName}`);
            }
        }
    };

    const handleRenamePage = async (oldId: string, newTitle: string) => {
        await renamePage(oldId, newTitle);
        if (pageId === oldId) {
            navigate(`/sessions/${sessionName}/pages/${encodeURIComponent(newTitle)}`, { replace: true });
        }
    };

    const handleResolveAvatarUrl = (avatarName: string) => {
        return getAvatarUrl(sessionName, avatarName);
    };

    return (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <PageListSidebar
                pages={pages}
                selectedPageId={isSettings ? null : (pageId || null)}
                onSelectPage={handleSelectPage}
                onDeletePage={handleDeletePage}
                onCreateClick={() => setCreateModalOpen(true)}
                onSettingsClick={handleSettingsClick}
                onRenamePage={handleRenamePage}
                onDuplicatePage={duplicatePage}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '10px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', height: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <strong>{sessionName}</strong>
                        {isSettings ? (
                            <>
                                <span style={{ color: '#ccc' }}>/</span>
                                <span>Settings</span>
                            </>
                        ) : (
                            <>
                                <span style={{ color: '#ccc' }}>/</span>
                                <span>{selectedPage?.title || (pageTitle ? 'Loading...' : 'No Page Selected')}</span>
                            </>
                        )}
                    </div>
                    <button
                        onClick={saveSession}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: '#646cff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Save Session
                    </button>
                </div>
                <ResizableSplitPane
                    left={<Outlet context={{ previewRef }} />}
                    right={showPreview && selectedPage && pageDef ? (
                        <div style={{
                            flex: 1, overflow: 'auto',
                            padding: '20px',
                            backgroundColor: '#f9f9f9', display: 'flex'
                        }}>
                            <div style={{ margin: '0 auto', width: 'fit-content', maxWidth: '100%' }}>
                                <PreviewControls
                                    exportWidth={exportWidth || ''}
                                    setExportWidth={(w) => handleDimsChange(w, undefined)}
                                    exportHeight={exportHeight || ''}
                                    setExportHeight={(h) => handleDimsChange(undefined, h)}
                                />
                                <PreviewContainer
                                    title={pageDef.getPreviewTitle(selectedPage)}
                                    exportWidth={exportWidth}
                                    exportHeight={exportHeight}
                                    onDimensionsChange={handleGenericDimensionsChange}
                                    containerRef={previewRef}
                                    style={pageDef.getPreviewStyle(selectedPage)}
                                >
                                    {pageDef.renderPreview({
                                        page: selectedPage,
                                        resolveAvatarUrl: handleResolveAvatarUrl,
                                        onDimensionsChange: handleGenericDimensionsChange,
                                        previewRef
                                    })}
                                </PreviewContainer>
                                {selectedPage.kind === PageKind.Code && (selectedPage.content as any)?.showHtml && (
                                    <div style={{ marginTop: '20px' }}>
                                        <strong>HTML Output:</strong>
                                        <pre
                                            style={{
                                                background: '#f4f4f4',
                                                padding: '10px',
                                                borderRadius: '4px',
                                                overflow: 'auto',
                                                maxHeight: '200px',
                                                fontSize: '12px',
                                            }}
                                            onClick={() => forceUpdate({})} // Click to update debug view if needed
                                        >
                                            {previewRef.current?.innerHTML || 'Click to refresh...'}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : undefined}
                />
            </div>
            <CreatePageModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onConfirm={(title: string, kind: PageKind) => {
                    createPage(title, kind).then(() => setCreateModalOpen(false));
                }}
            />
        </div>
    );
}

export const SessionDetailLayout: React.FC = () => {
    const { sessionName } = useParams();

    if (!sessionName) return null;

    return (
        <SessionDetailProvider sessionName={sessionName}>
            <SessionDetailContent />
        </SessionDetailProvider>
    );
};
