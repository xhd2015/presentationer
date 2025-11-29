import React, { useState, useEffect, useRef } from 'react';
import { MdAdd, MdCheck, MdClose, MdDelete, MdEdit } from 'react-icons/md';
import { type Session } from '../../api/session';

interface SessionListSidebarProps {
    sessions: Session[];
    selectedSessionName: string | null;
    onSelectSession: (name: string) => void;
    onDeleteSession: (name: string) => void;
    onCreateClick: () => void;
    onRenameSession?: (oldName: string, newName: string) => Promise<void>;
}

export const SessionListSidebar: React.FC<SessionListSidebarProps> = ({
    sessions,
    selectedSessionName,
    onSelectSession,
    onDeleteSession,
    onCreateClick,
    onRenameSession,
}) => {
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingId]);

    const handleDeleteClick = (name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteConfirmId(name);
        setEditingId(null);
    };

    const handleDeleteConfirm = (name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onDeleteSession(name);
        setDeleteConfirmId(null);
    };

    const handleEditClick = (name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(name);
        setEditValue(name);
        setDeleteConfirmId(null);
    };

    const handleEditSave = async (e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation();
        if (!editingId) return;

        const newName = editValue.trim();
        if (newName && newName !== editingId) {
            if (onRenameSession) {
                try {
                    await onRenameSession(editingId, newName);
                    setEditingId(null);
                } catch (err) {
                    // Error handled by parent mostly, but we keep editing state
                }
            } else {
                setEditingId(null);
            }
        } else {
            setEditingId(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleEditSave(e);
        } else if (e.key === 'Escape') {
            setEditingId(null);
        }
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
                            fontWeight: selectedSessionName === s.name ? 'bold' : 'normal',
                            minHeight: '40px'
                        }}
                    >
                        {editingId === s.name ? (
                            <div style={{ display: 'flex', alignItems: 'center', flex: 1, marginRight: '5px' }} onClick={(e) => e.stopPropagation()}>
                                <input
                                    ref={inputRef}
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    style={{ width: '100%', padding: '2px' }}
                                />
                            </div>
                        ) : (
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '10px', flex: 1 }}>{s.name}</span>
                        )}

                        <div style={{ position: 'relative', display: 'flex', gap: '4px' }}>
                            {editingId === s.name ? (
                                <>
                                    <button onClick={handleEditSave} style={{ color: 'green', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}><MdCheck /></button>
                                    <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} style={{ color: '#666', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}><MdClose /></button>
                                </>
                            ) : deleteConfirmId === s.name ? (
                                <div style={{ position: 'absolute', right: 0, top: '-6px', background: 'white', border: '1px solid #ccc', borderRadius: '4px', display: 'flex', padding: '2px', zIndex: 10 }}>
                                    <button onClick={(e) => handleDeleteConfirm(s.name, e)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}><MdCheck /></button>
                                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }} style={{ color: '#666', border: 'none', background: 'none', cursor: 'pointer' }}><MdClose /></button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={(e) => handleEditClick(s.name, e)}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999', padding: 0 }}
                                        title="Rename"
                                    >
                                        <MdEdit size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteClick(s.name, e)}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999', padding: 0 }}
                                        title="Delete"
                                    >
                                        <MdDelete size={16} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
