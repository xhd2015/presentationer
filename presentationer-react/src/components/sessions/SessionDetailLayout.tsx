import React, { useState, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { PageListSidebar } from './PageListSidebar';
import { SessionDetailProvider, useSessionDetailContext } from '../../context/SessionDetailContext';
import { CreatePageModal } from './CreatePageModal';
import { PreviewPanel } from '../code-presenter/PreviewPanel';
import { IMPreview } from '../im/IMPreview';
import { parseLineConfig } from '../code-presenter/focus';
import { getAvatarUrl } from '../../api/session';
import { ResizableSplitPane } from '../common/ResizableSplitPane';
import { PreviewControls } from '../common/PreviewControls';

const SessionDetailContent: React.FC = () => {
    const { pages, createPage, deletePage, sessionName, saveSession, renamePage, updatePageContent } = useSessionDetailContext();
    const { pageTitle } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);

    const decodedPageTitle = pageTitle ? decodeURIComponent(pageTitle) : undefined;
    const isSettings = location.pathname.endsWith('/settings');
    const selectedPage = pages.find(p => p.title === decodedPageTitle);
    const pageId = selectedPage?.id;
    const showPreview = !isSettings && !!selectedPage;

    // Extract dims
    let exportWidth: string | undefined;
    let exportHeight: string | undefined;
    if (selectedPage) {
        if (selectedPage.kind === 'code') {
            exportWidth = (selectedPage.content as any).exportWidth;
            exportHeight = (selectedPage.content as any).exportHeight;
        } else if (selectedPage.kind === 'chat_thread') {
            if (typeof selectedPage.content !== 'string') {
                exportWidth = (selectedPage.content as any).exportWidth;
                exportHeight = (selectedPage.content as any).exportHeight;
            }
        }
    }

    const handleDimsChange = useCallback((w: string | undefined, h: string | undefined) => {
        if (!selectedPage) return;
        let newContent = selectedPage.content;

        if (selectedPage.kind === 'chat_thread' && typeof newContent === 'string') {
            newContent = { json: newContent };
        }

        const updatedContent = { ...newContent };
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

    const handleIMDimensionsChange = useCallback((w: number, h: number) => {
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
                    right={showPreview ? (
                        <div style={{ flex: 1, overflow: 'auto', padding: '20px', backgroundColor: '#f9f9f9', display: 'flex' }}>
                            <div style={{ margin: '0 auto', width: 'fit-content', maxWidth: '100%' }}>
                                <PreviewControls
                                    exportWidth={exportWidth || ''}
                                    setExportWidth={(w) => handleDimsChange(w, undefined)}
                                    exportHeight={exportHeight || ''}
                                    setExportHeight={(h) => handleDimsChange(undefined, h)}
                                />
                                {selectedPage.kind === 'code' && (
                                    <PreviewPanel
                                        code={(selectedPage.content as any).code || ''}
                                        language={(selectedPage.content as any).language}
                                        isFocusMode={!!(selectedPage.content as any).selectedConfigId}
                                        focusedLines={parseLineConfig(
                                            ((selectedPage.content as any).configList || []).find((c: any) => c.id === (selectedPage.content as any).selectedConfigId)?.lines || ''
                                        )}
                                        showHtml={(selectedPage.content as any).showHtml}
                                        onDimensionsChange={(w, h) => {
                                            handleDimsChange(w.toString(), h.toString());
                                        }}
                                        previewRef={previewRef}
                                        exportWidth={exportWidth}
                                        exportHeight={exportHeight}
                                    />
                                )}
                                {selectedPage.kind === 'chat_thread' && (
                                    <IMPreview
                                        key={selectedPage.id}
                                        jsonInput={typeof selectedPage.content === 'string' ? selectedPage.content : (selectedPage.content as any).json || ''}
                                        onResolveAvatarUrl={handleResolveAvatarUrl}
                                        exportWidth={exportWidth}
                                        exportHeight={exportHeight}
                                        onDimensionsChange={handleIMDimensionsChange}
                                    />
                                )}
                            </div>
                        </div>
                    ) : undefined}
                />
            </div>
            <CreatePageModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onConfirm={(title: string, kind: 'code' | 'chat_thread') => {
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
