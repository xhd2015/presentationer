import React, { useState } from 'react';
import { MdAdd, MdCheck, MdClose, MdDelete } from 'react-icons/md';
import { type Session } from '../../api/session';

interface SessionListSidebarProps {
    sessions: Session[];
    selectedSessionName: string | null;
    onSelectSession: (name: string) => void;
    onDeleteSession: (name: string) => void;
    onCreateClick: () => void;
}

export const SessionListSidebar: React.FC<SessionListSidebarProps> = ({
    sessions,
    selectedSessionName,
    onSelectSession,
    onDeleteSession,
    onCreateClick,
}) => {
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const handleDeleteClick = (name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteConfirmId(name);
    };

    const handleDeleteConfirm = (name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onDeleteSession(name);
        setDeleteConfirmId(null);
    };

    return (
        <div style={{ width: '250px', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', backgroundColor: '#f0f0f0' }}>
            <div style={{ padding: '10px 15px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>Sessions</h4>
                <button onClick={onCreateClick} style={{ cursor: 'pointer', padding: '2px 6px' }}><MdAdd /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {sessions.map(s => (
                    <div
                        key={s.name}
                        onClick={() => onSelectSession(s.name)}
                        style={{
                            padding: '10px 15px',
                            borderBottom: '1px solid #eee',
                            backgroundColor: selectedSessionName === s.name ? '#fff' : 'transparent',
                            cursor: 'pointer',
                            position: 'relative',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontWeight: selectedSessionName === s.name ? 'bold' : 'normal'
                        }}
                    >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '10px' }}>{s.name}</span>

                        <div style={{ position: 'relative' }}>
                            {deleteConfirmId === s.name ? (
                                <div style={{ position: 'absolute', right: 0, top: '-10px', background: 'white', border: '1px solid #ccc', borderRadius: '4px', display: 'flex', padding: '2px', zIndex: 10 }}>
                                    <button onClick={(e) => handleDeleteConfirm(s.name, e)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}><MdCheck /></button>
                                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }} style={{ color: '#666', border: 'none', background: 'none', cursor: 'pointer' }}><MdClose /></button>
                                </div>
                            ) : (
                                <button
                                    onClick={(e) => handleDeleteClick(s.name, e)}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999', display: 'flex' }}
                                >
                                    <MdDelete size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

