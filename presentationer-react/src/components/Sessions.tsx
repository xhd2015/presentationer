import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { listSessions, createSession, deleteSession, updateSession, getSession, type Session, type Page } from '../api/session';
import { type CodePresenterRef } from './CodePresenter';
import { type IMThreadGeneratorRef } from './IMThreadGenerator';
import { SessionListSidebar } from './sessions/SessionListSidebar';
import { PageListSidebar } from './sessions/PageListSidebar';
import { ContentArea } from './sessions/ContentArea';
import { CreateSessionModal } from './sessions/CreateSessionModal';
import { CreatePageModal } from './sessions/CreatePageModal';

const Sessions: React.FC = () => {
    // Session List State
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSessionName, setSelectedSessionName] = useState<string | null>(null);

    // Page State
    const [pages, setPages] = useState<Page[]>([]);
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

    // View State
    const [viewMode, setViewMode] = useState<'page' | 'settings'>('page');

    // Modals
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [isPageModalOpen, setIsPageModalOpen] = useState(false);

    // Component Ref
    const codePresenterRef = useRef<CodePresenterRef>(null);
    const imThreadRef = useRef<IMThreadGeneratorRef>(null);

    const fetchSessions = async (signal?: AbortSignal) => {
        try {
            const data = await listSessions(signal);
            setSessions(data || []);
        } catch (error: any) {
            if (error.name === 'AbortError') return;
            console.error(error);
            toast.error('Failed to load sessions');
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchSessions(controller.signal);
        return () => controller.abort();
    }, []);

    // --- Session Handlers ---

    const handleDeleteSession = async (name: string) => {
        try {
            await deleteSession(name);
            toast.success('Deleted');
            if (selectedSessionName === name) {
                setSelectedSessionName(null);
                setPages([]);
                setSelectedPageId(null);
            }
            fetchSessions();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleCreateSession = async (name: string) => {
        try {
            // Default with one code page
            const initialPages: Page[] = [
                {
                    id: Date.now().toString(),
                    title: 'Main Code',
                    kind: 'code',
                    content: { code: `package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, World!")\n}` }
                }
            ];
            await createSession(name, initialPages);
            toast.success('Session created');
            setIsSessionModalOpen(false);
            await fetchSessions();
            handleSelectSession(name);
        } catch (error: any) {
            toast.error(error.message || 'Failed to create session');
        }
    };

    const handleSelectSession = async (name: string) => {
        if (selectedSessionName === name) return;
        try {
            const session = await getSession(name);
            let loadedPages: Page[] = [];

            if (session.pages) {
                loadedPages = session.pages;
            } else {
                // Empty session? default to one code page
                loadedPages = [
                    {
                        id: Date.now().toString(),
                        title: 'Code',
                        kind: 'code',
                        content: {}
                    }
                ];
            }

            setPages(loadedPages);
            setSelectedSessionName(name);
            if (loadedPages.length > 0) {
                setSelectedPageId(loadedPages[0].id);
            } else {
                setSelectedPageId(null);
            }
            setViewMode('page');
        } catch (error) {
            console.error(error);
            toast.error("Failed to load session");
        }
    };

    // --- Page Handlers ---

    // Helper to save current page state into the `pages` array state
    const captureCurrentState = () => {
        if (!selectedPageId || viewMode === 'settings') return;
        const idx = pages.findIndex(p => p.id === selectedPageId);
        if (idx === -1) return;

        const updatedPages = [...pages];
        const page = updatedPages[idx];

        if (page.kind === 'code' && codePresenterRef.current) {
            page.content = codePresenterRef.current.getState();
        } else if (page.kind === 'chat_thread' && imThreadRef.current) {
            page.content = imThreadRef.current.getState();
        }
        updatedPages[idx] = page;
        setPages(updatedPages);
    };

    const handleSaveSession = async () => {
        if (!selectedSessionName) return;

        // Capture current page state before saving if in page mode
        if (viewMode === 'page') {
            const currentPages = [...pages];
            const currentPageIndex = currentPages.findIndex(p => p.id === selectedPageId);

            if (currentPageIndex !== -1) {
                const page = currentPages[currentPageIndex];
                if (page.kind === 'code' && codePresenterRef.current) {
                    page.content = codePresenterRef.current.getState();
                } else if (page.kind === 'chat_thread' && imThreadRef.current) {
                    page.content = imThreadRef.current.getState();
                }
                currentPages[currentPageIndex] = page;
                setPages(currentPages);
            }
            try {
                await updateSession(selectedSessionName, currentPages);
                toast.success("Saved");
                fetchSessions();
            } catch (error: any) {
                toast.error(error.message || "Failed to save");
            }
        } else {
            // If in settings mode, just save what we have in state (pages might be updated by sidebar actions?)
            // Actually, sidebar delete adds/removes pages directly from state.
            try {
                await updateSession(selectedSessionName, pages);
                toast.success("Saved");
                fetchSessions();
            } catch (error: any) {
                toast.error(error.message || "Failed to save");
            }
        }
    };

    const handleSelectPage = (id: string) => {
        if (selectedPageId === id && viewMode === 'page') return;
        captureCurrentState();
        setSelectedPageId(id);
        setViewMode('page');
    };

    const handleSettingsClick = () => {
        if (viewMode === 'settings') return;
        captureCurrentState();
        setViewMode('settings');
    };

    const handleCreatePage = async (title: string, kind: 'code' | 'chat_thread') => {
        // captureCurrentState(); // Save current before adding new

        let currentPages = [...pages];
        // If we were on a page, capture its state
        if (viewMode === 'page' && selectedPageId) {
            const idx = currentPages.findIndex(p => p.id === selectedPageId);
            if (idx !== -1) {
                const page = currentPages[idx];
                if (page.kind === 'code' && codePresenterRef.current) {
                    page.content = codePresenterRef.current.getState();
                } else if (page.kind === 'chat_thread' && imThreadRef.current) {
                    page.content = imThreadRef.current.getState();
                }
                currentPages[idx] = page;
            }
        }

        const newPage: Page = {
            id: Date.now().toString(),
            title: title,
            kind: kind,
            content: kind === 'code' ? {} : undefined
        };

        const updatedPages = [...currentPages, newPage];
        setPages(updatedPages);
        setIsPageModalOpen(false);
        setSelectedPageId(newPage.id);
        setViewMode('page');

        // Auto save session
        if (selectedSessionName) {
            try {
                await updateSession(selectedSessionName, updatedPages);
                toast.success("Page added");
            } catch (e) {
                toast.error("Failed to save session");
            }
        }
    };

    const handleDeletePage = async (id: string) => {
        const updatedPages = pages.filter(p => p.id !== id);
        setPages(updatedPages);
        if (selectedPageId === id) {
            setSelectedPageId(updatedPages.length > 0 ? updatedPages[0].id : null);
        }

        // Auto save
        if (selectedSessionName) {
            try {
                await updateSession(selectedSessionName, updatedPages);
                toast.success("Page deleted");
            } catch (e) {
                toast.error("Failed to save session");
            }
        }
    };

    const selectedPage = pages.find(p => p.id === selectedPageId);

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
            <SessionListSidebar
                sessions={sessions}
                selectedSessionName={selectedSessionName}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
                onCreateClick={() => setIsSessionModalOpen(true)}
            />

            {selectedSessionName && (
                <PageListSidebar
                    pages={pages}
                    selectedPageId={viewMode === 'settings' ? null : selectedPageId}
                    onSelectPage={handleSelectPage}
                    onDeletePage={handleDeletePage}
                    onCreateClick={() => setIsPageModalOpen(true)}
                    onSettingsClick={handleSettingsClick}
                />
            )}

            <ContentArea
                selectedSessionName={selectedSessionName}
                selectedPage={selectedPage}
                onSaveSession={handleSaveSession}
                codePresenterRef={codePresenterRef}
                imThreadRef={imThreadRef}
                viewMode={viewMode}
            />

            <CreateSessionModal
                isOpen={isSessionModalOpen}
                onClose={() => setIsSessionModalOpen(false)}
                onConfirm={handleCreateSession}
            />

            <CreatePageModal
                isOpen={isPageModalOpen}
                onClose={() => setIsPageModalOpen(false)}
                onConfirm={handleCreatePage}
            />
        </div>
    );
};

export default Sessions;
