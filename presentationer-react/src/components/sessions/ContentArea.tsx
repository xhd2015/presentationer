import React from 'react';
import CodePresenter, { type CodePresenterRef } from '../CodePresenter';
import IMThreadGenerator, { type IMThreadGeneratorRef } from '../IMThreadGenerator';
import { type Page, getAvatarUrl, listAvatars } from '../../api/session';
import { SessionSettings } from './SessionSettings';

interface ContentAreaProps {
    selectedSessionName: string | null;
    selectedPage: Page | undefined;
    onSaveSession: () => void;
    codePresenterRef: React.RefObject<CodePresenterRef | null>;
    imThreadRef: React.RefObject<IMThreadGeneratorRef | null>;
    viewMode?: 'page' | 'settings';
}

export const ContentArea: React.FC<ContentAreaProps> = ({
    selectedSessionName,
    selectedPage,
    onSaveSession,
    codePresenterRef,
    imThreadRef,
    viewMode = 'page',
}) => {
    const handleResolveAvatarUrl = (avatarName: string) => {
        if (!selectedSessionName) return avatarName;
        return getAvatarUrl(selectedSessionName, avatarName);
    };

    const handleListAvatars = async () => {
        if (!selectedSessionName) return [];
        try {
            return await listAvatars(selectedSessionName);
        } catch (e) {
            console.error("Failed to list avatars", e);
            return [];
        }
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {selectedSessionName ? (
                <>
                    <div style={{ padding: '10px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', height: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <strong>{selectedSessionName}</strong>
                            {viewMode === 'page' && (
                                <>
                                    <span style={{ color: '#ccc' }}>/</span>
                                    <span>{selectedPage?.title || 'No Page Selected'}</span>
                                </>
                            )}
                            {viewMode === 'settings' && (
                                <>
                                    <span style={{ color: '#ccc' }}>/</span>
                                    <span>Settings</span>
                                </>
                            )}
                        </div>
                        <button
                            onClick={onSaveSession}
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

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {viewMode === 'settings' ? (
                            <SessionSettings sessionName={selectedSessionName} />
                        ) : selectedPage ? (
                            <>
                                {selectedPage.kind === 'code' && (
                                    <CodePresenter
                                        key={selectedPage.id}
                                        initialState={selectedPage.content}
                                        ref={codePresenterRef}
                                    />
                                )}
                                {selectedPage.kind === 'chat_thread' && (
                                    <IMThreadGenerator
                                        key={selectedPage.id}
                                        initialState={selectedPage.content}
                                        ref={imThreadRef}
                                        onResolveAvatarUrl={handleResolveAvatarUrl}
                                        onListAvatars={handleListAvatars}
                                    />
                                )}
                            </>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#888' }}>
                                Select or create a page
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#888' }}>
                    Select a session
                </div>
            )}
        </div>
    );
};
