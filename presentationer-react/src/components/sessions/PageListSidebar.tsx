import React, { useState, useEffect, useRef } from 'react';
import { MdAdd, MdChat, MdCheck, MdClose, MdDelete, MdDescription, MdSettings, MdEdit, MdContentCopy, MdInsertChart } from 'react-icons/md';
import { type Page, PageKind } from '../../api/session';

interface PageListSidebarProps {
    pages: Page[];
    selectedPageId: string | null;
    onSelectPage: (id: string) => void;
    onDeletePage: (id: string) => void;
    onCreateClick: () => void;
    onSettingsClick: () => void;
    onRenamePage?: (id: string, newTitle: string) => Promise<void>;
    onDuplicatePage?: (id: string) => Promise<void>;
}

export const PageListSidebar: React.FC<PageListSidebarProps> = ({
    pages,
    selectedPageId,
    onSelectPage,
    onDeletePage,
    onCreateClick,
    onSettingsClick,
    onRenamePage,
    onDuplicatePage,
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

    const handleEditClick = (id: string, title: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(id);
        setEditValue(title);
        setDeleteConfirmId(null);
    };

    const handleEditSave = async (e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation();
        if (!editingId) return;

        const newTitle = editValue.trim();
        if (newTitle) {
            if (onRenamePage) {
                try {
                    await onRenamePage(editingId, newTitle);
                    setEditingId(null);
                } catch (e) {
                    // keep editing
                }
            } else {
                setEditingId(null);
            }
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
        <div style={{ width: '200px', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa' }}>
            <div style={{ padding: '10px 15px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>Pages</h4>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={onSettingsClick} title="Session Settings" style={{ cursor: 'pointer', padding: '2px 6px', border: 'none', background: 'transparent', color: '#555' }}><MdSettings size={16} /></button>
                    <button onClick={onCreateClick} title="New Page" style={{ cursor: 'pointer', padding: '2px 6px' }}><MdAdd /></button>
                </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {pages.map(p => (
                    <div
                        key={p.id}
                        onClick={() => onSelectPage(p.id)}
                        style={{
                            padding: '8px 15px',
                            cursor: 'pointer',
                            backgroundColor: selectedPageId === p.id ? '#eef' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '14px',
                            minHeight: '36px'
                        }}
                    >
                        {editingId === p.id ? (
                            <div style={{ display: 'flex', alignItems: 'center', flex: 1, marginRight: '5px' }} onClick={(e) => e.stopPropagation()}>
                                <input
                                    ref={inputRef}
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    style={{ width: '100%', padding: '2px', fontSize: '14px' }}
                                />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', flex: 1 }}>
                                {p.kind === PageKind.Code ? <MdDescription size={14} /> :
                                    p.kind === PageKind.ChatThread ? <MdChat size={14} /> :
                                        <MdInsertChart size={14} />}
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                            </div>
                        )}

                        <div style={{ position: 'relative', display: 'flex', gap: '4px' }}>
                            {editingId === p.id ? (
                                <>
                                    <button onClick={handleEditSave} style={{ color: 'green', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}><MdCheck size={14} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} style={{ color: '#666', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}><MdClose size={14} /></button>
                                </>
                            ) : deleteConfirmId === p.id ? (
                                <div style={{ position: 'absolute', right: 0, top: '-10px', background: 'white', border: '1px solid #ccc', borderRadius: '4px', display: 'flex', padding: '2px', zIndex: 10 }}>
                                    <button onClick={(e) => { e.stopPropagation(); onDeletePage(p.id); setDeleteConfirmId(null); }} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}><MdCheck size={12} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }} style={{ color: '#666', border: 'none', background: 'none', cursor: 'pointer' }}><MdClose size={12} /></button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={(e) => handleEditClick(p.id, p.title, e)}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#bbb', padding: 0 }}
                                        title="Rename"
                                    >
                                        <MdEdit size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDuplicatePage?.(p.id); }}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#bbb', padding: 0 }}
                                        title="Duplicate"
                                    >
                                        <MdContentCopy size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(p.id); setEditingId(null); }}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#bbb', display: 'flex', padding: 0 }}
                                        title="Delete"
                                    >
                                        <MdDelete size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
                {pages.length === 0 && <div style={{ padding: '15px', color: '#999', fontSize: '12px' }}>No pages</div>}
            </div>
        </div>
    );
};
