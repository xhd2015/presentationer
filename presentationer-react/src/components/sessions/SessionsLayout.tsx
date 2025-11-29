import React, { useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { SessionListSidebar } from './SessionListSidebar';
import { useSessionContext } from '../../context/SessionContext';
import { CreateSessionModal } from './CreateSessionModal';

export const SessionsLayout: React.FC = () => {
    const { sessions, createSession, deleteSession, renameSession } = useSessionContext();
    const { sessionName } = useParams();
    const navigate = useNavigate();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    const handleSelectSession = (name: string) => {
        navigate(`/sessions/${name}`);
    };

    const handleDeleteSession = async (name: string) => {
        await deleteSession(name);
        if (sessionName === name) {
            navigate('/sessions');
        }
    };

    const handleRenameSession = async (oldName: string, newName: string) => {
        await renameSession(oldName, newName);
        if (sessionName === oldName) {
            navigate(`/sessions/${newName}`, { replace: true });
        }
    };

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
            <SessionListSidebar
                sessions={sessions}
                selectedSessionName={sessionName || null}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
                onCreateClick={() => setCreateModalOpen(true)}
                onRenameSession={handleRenameSession}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Outlet />
            </div>
            <CreateSessionModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onConfirm={(name) => {
                    createSession(name).then(() => setCreateModalOpen(false));
                }}
            />
        </div>
    );
};

