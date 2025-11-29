import React, { useState, useRef } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { PageListSidebar } from './PageListSidebar';
import { SessionDetailProvider, useSessionDetailContext } from '../../context/SessionDetailContext';
import { CreatePageModal } from './CreatePageModal';
import { PreviewPanel } from '../code-presenter/PreviewPanel';
import { IMPreview } from '../im/IMPreview';
import { parseLineConfig } from '../code-presenter/focus';
import { getAvatarUrl } from '../../api/session';

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

    const exportWidth = selectedPage?.kind === 'code' ? (selectedPage.content as any).exportWidth : undefined;
    const exportHeight = selectedPage?.kind === 'code' ? (selectedPage.content as any).exportHeight : undefined;

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
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
                    <div style={{ flex: 1, overflow: 'hidden', borderRight: '1px solid #eee' }}>
                        <Outlet context={{ previewRef }} />
                    </div>

                    {!isSettings && selectedPage && (
                        <div style={{ width: '50%', overflow: 'auto', padding: '20px', backgroundColor: '#f9f9f9' }}>
                            {selectedPage.kind === 'code' && (
                                <PreviewPanel
                                    code={(selectedPage.content as any).code || ''}
                                    isFocusMode={!!(selectedPage.content as any).selectedConfigId}
                                    focusedLines={parseLineConfig(
                                        ((selectedPage.content as any).configList || []).find((c: any) => c.id === (selectedPage.content as any).selectedConfigId)?.lines || ''
                                    )}
                                    showHtml={(selectedPage.content as any).showHtml}
                                    onDimensionsChange={(w, h) => {
                                        updatePageContent(selectedPage.id, {
                                            ...selectedPage.content,
                                            exportWidth: w.toString(),
                                            exportHeight: h.toString()
                                        });
                                    }}
                                    previewRef={previewRef}
                                    exportWidth={exportWidth}
                                    exportHeight={exportHeight}
                                />
                            )}
                            {selectedPage.kind === 'chat_thread' && (
                                <IMPreview
                                    jsonInput={selectedPage.content as string || ''}
                                    onResolveAvatarUrl={handleResolveAvatarUrl}
                                />
                            )}
                        </div>
                    )}
                </div>
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
