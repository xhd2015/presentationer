import React, { useState } from 'react';
import { MdAdd, MdChat, MdCheck, MdClose, MdDelete, MdDescription, MdSettings } from 'react-icons/md';
import { type Page } from '../../api/session';

interface PageListSidebarProps {
    pages: Page[];
    selectedPageId: string | null;
    onSelectPage: (id: string) => void;
    onDeletePage: (id: string) => void;
    onCreateClick: () => void;
    onSettingsClick: () => void;
}

export const PageListSidebar: React.FC<PageListSidebarProps> = ({
    pages,
    selectedPageId,
    onSelectPage,
    onDeletePage,
    onCreateClick,
    onSettingsClick,
}) => {
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
                            fontSize: '14px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                            {p.kind === 'code' ? <MdDescription size={14} /> : <MdChat size={14} />}
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                        </div>

                        <div style={{ position: 'relative' }}>
                            {deleteConfirmId === p.id ? (
                                <div style={{ position: 'absolute', right: 0, top: '-10px', background: 'white', border: '1px solid #ccc', borderRadius: '4px', display: 'flex', padding: '2px', zIndex: 10 }}>
                                    <button onClick={(e) => { e.stopPropagation(); onDeletePage(p.id); setDeleteConfirmId(null); }} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}><MdCheck size={12} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }} style={{ color: '#666', border: 'none', background: 'none', cursor: 'pointer' }}><MdClose size={12} /></button>
                                </div>
                            ) : (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(p.id); }}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#bbb', display: 'flex', padding: '2px' }}
                                >
                                    <MdDelete size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {pages.length === 0 && <div style={{ padding: '15px', color: '#999', fontSize: '12px' }}>No pages</div>}
            </div>
        </div>
    );
};
