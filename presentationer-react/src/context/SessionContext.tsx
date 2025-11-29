import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { listSessions, createSession, deleteSession, renameSession, type Session, type Page } from '../api/session';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface SessionContextType {
    sessions: Session[];
    refreshSessions: () => Promise<void>;
    createSession: (name: string) => Promise<void>;
    deleteSession: (name: string) => Promise<void>;
    renameSession: (oldName: string, newName: string) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | null>(null);

export const useSessionContext = () => {
    const context = useContext(SessionContext);
    if (!context) throw new Error("useSessionContext must be used within SessionProvider");
    return context;
};

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const navigate = useNavigate();

    const refreshSessions = useCallback(async () => {
        try {
            const data = await listSessions();
            setSessions(data || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load sessions');
        }
    }, []);

    useEffect(() => {
        refreshSessions();
    }, [refreshSessions]);

    const handleCreateSession = async (name: string) => {
        try {
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
            await refreshSessions();
            navigate(`/sessions/${name}`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to create session');
            throw error;
        }
    };

    const handleDeleteSession = async (name: string) => {
        try {
            await deleteSession(name);
            toast.success('Deleted');
            await refreshSessions();
        } catch (error: any) {
            toast.error('Failed to delete');
            throw error;
        }
    };

    const handleRenameSession = async (oldName: string, newName: string) => {
        try {
            await renameSession(oldName, newName);
            toast.success('Renamed');
            await refreshSessions();
        } catch (error: any) {
            toast.error(error.message || 'Failed to rename');
            throw error;
        }
    };

    return (
        <SessionContext.Provider value={{
            sessions,
            refreshSessions,
            createSession: handleCreateSession,
            deleteSession: handleDeleteSession,
            renameSession: handleRenameSession
        }}>
            {children}
        </SessionContext.Provider>
    );
};

