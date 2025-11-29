import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getSession, updateSession, createPage as createPageApi, deletePage as deletePageApi, updatePage as updatePageApi, type Page, PageKind } from '../api/session';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface SessionDetailContextType {
    sessionName: string;
    pages: Page[];
    loading: boolean;
    refreshPages: () => Promise<void>;
    saveSession: () => Promise<void>;
    updatePageContent: (pageId: string, content: any) => void;
    createPage: (title: string, kind: PageKind) => Promise<void>;
    deletePage: (pageId: string) => Promise<void>;
    renamePage: (pageId: string, newTitle: string) => Promise<void>;
    duplicatePage: (pageId: string) => Promise<void>;
}

const SessionDetailContext = createContext<SessionDetailContextType | null>(null);

export const useSessionDetailContext = () => {
    const context = useContext(SessionDetailContext);
    if (!context) throw new Error("useSessionDetailContext must be used within SessionDetailProvider");
    return context;
};

export const SessionDetailProvider: React.FC<{ sessionName: string; children: React.ReactNode }> = ({ sessionName, children }) => {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const pagesRef = useRef(pages);
    useEffect(() => { pagesRef.current = pages; }, [pages]);

    // Debounce ref
    const debouncedSaveRef = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({});

    const refreshPages = useCallback(async () => {
        if (!sessionName) return;
        setLoading(true);
        try {
            const session = await getSession(sessionName);
            let loadedPages = session.pages || [];
            if (loadedPages.length === 0 && session.pages === undefined) {
                loadedPages = [
                    {
                        id: Date.now().toString(),
                        title: 'Code',
                        kind: PageKind.Code,
                        content: {}
                    }
                ];
            }
            setPages(loadedPages);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load session details");
        } finally {
            setLoading(false);
        }
    }, [sessionName]);

    useEffect(() => {
        refreshPages();
    }, [refreshPages]);

    const updatePageContent = useCallback((pageId: string, content: any) => {
        setPages(prev => {
            const idx = prev.findIndex(p => p.id === pageId);
            if (idx === -1) return prev;
            const newPages = [...prev];
            const resolvedContent = typeof content === 'function' ? content(newPages[idx].content) : content;
            const newPage = { ...newPages[idx], content: resolvedContent };
            newPages[idx] = newPage;

            // Trigger auto-save
            if (debouncedSaveRef.current[pageId]) {
                clearTimeout(debouncedSaveRef.current[pageId]);
            }
            debouncedSaveRef.current[pageId] = setTimeout(() => {
                updatePageApi(sessionName, newPage)
                    .then(() => {
                        console.log("Auto-saved page", pageId);
                    })
                    .catch(err => {
                        console.error("Auto-save failed", err);
                        toast.error("Auto-save failed");
                    });
            }, 1000);

            return newPages;
        });
    }, [sessionName]);

    const saveSession = useCallback(async () => {
        // Clear any pending auto-saves for current pages to avoid race conditions?
        // Or just let them run. If we do full update, it might conflict with individual updates?
        // But saveSession uses updateSession which writes all pages.
        // Ideally we should cancel pending auto-saves.
        Object.values(debouncedSaveRef.current).forEach(clearTimeout);
        debouncedSaveRef.current = {};

        try {
            await updateSession(sessionName, pagesRef.current);
            toast.success("Saved");
            refreshPages();
        } catch (error: any) {
            toast.error(error.message || "Failed to save");
        }
    }, [sessionName, refreshPages]);

    const createPage = async (title: string, kind: PageKind) => {
        if (pages.some(p => p.title === title)) {
            toast.error("Page name must be unique");
            throw new Error("Page name must be unique");
        }

        const newPage: Page = {
            id: Date.now().toString(),
            title: title,
            kind: kind,
            content: (kind === PageKind.Code || kind === PageKind.Chart) ? {} : undefined
        };

        const updatedPages = [...pages, newPage];
        setPages(updatedPages);

        navigate(`/sessions/${sessionName}/pages/${encodeURIComponent(newPage.title)}`);

        try {
            await createPageApi(sessionName, newPage);
            toast.success("Page added");
        } catch (e) {
            toast.error("Failed to create page");
            refreshPages();
        }
    };

    const deletePage = async (pageId: string) => {
        const updatedPages = pages.filter(p => p.id !== pageId);
        setPages(updatedPages);

        try {
            await deletePageApi(sessionName, pageId);
            toast.success("Page deleted");
        } catch (e) {
            toast.error("Failed to delete page");
            refreshPages();
        }
    };

    const renamePage = async (pageId: string, newTitle: string) => {
        if (pages.some(p => p.title === newTitle && p.id !== pageId)) {
            throw new Error("Page name already exists");
        }

        const page = pages.find(p => p.id === pageId);
        if (!page) return;

        const updatedPage = { ...page, title: newTitle };

        setPages(prev => prev.map(p => p.id === pageId ? updatedPage : p));

        try {
            await updatePageApi(sessionName, updatedPage);
            toast.success("Renamed");
        } catch (e) {
            toast.error("Failed to rename");
            refreshPages();
            throw e;
        }
    };

    const duplicatePage = async (pageId: string) => {
        const page = pages.find(p => p.id === pageId);
        if (!page) return;

        let newTitle = `${page.title} Copy`;
        let counter = 1;
        // Use pagesRef.current to get latest pages if closure is stale, but setPages updates state.
        // We should use current pages.
        const currentPages = pagesRef.current;
        while (currentPages.some(p => p.title === newTitle)) {
            counter++;
            newTitle = `${page.title} Copy ${counter}`;
        }

        const newContent = page.content ? JSON.parse(JSON.stringify(page.content)) : undefined;

        const newPage: Page = {
            id: Date.now().toString(),
            title: newTitle,
            kind: page.kind,
            content: newContent
        };

        const updatedPages = [...currentPages, newPage];
        setPages(updatedPages);

        navigate(`/sessions/${sessionName}/pages/${encodeURIComponent(newPage.title)}`);

        try {
            await createPageApi(sessionName, newPage);
            toast.success("Page duplicated");
        } catch (e) {
            toast.error("Failed to duplicate page");
            refreshPages();
        }
    };

    return (
        <SessionDetailContext.Provider value={{
            sessionName,
            pages,
            loading,
            refreshPages,
            saveSession,
            updatePageContent,
            createPage,
            deletePage,
            renamePage,
            duplicatePage
        }}>
            {children}
        </SessionDetailContext.Provider>
    );
};
