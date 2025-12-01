import React, { useState, useEffect } from 'react';
import { PageKind } from '../../api/session';

interface CreatePageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (title: string, kind: PageKind) => void;
}

export const CreatePageModal: React.FC<CreatePageModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [title, setTitle] = useState('');
    const [kind, setKind] = useState<PageKind>(PageKind.Code);

    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setKind(PageKind.Code);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(title, kind);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '300px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginTop: 0 }}>Create New Page</h3>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Page Title"
                    autoFocus
                    style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
                />
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ marginRight: '10px' }}>Kind:</label>
                    <select value={kind} onChange={(e) => setKind(e.target.value as PageKind)} style={{ padding: '4px' }}>
                        <option value={PageKind.Code}>Code Presenter</option>
                        <option value={PageKind.ChatThread}>Chat Thread</option>
                        <option value={PageKind.Chart}>Chart</option>
                        <option value={PageKind.Rectangle}>Rectangle</option>
                        <option value={PageKind.ConnectedRectangles}>Connected Rectangles</option>
                    </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', borderRadius: '4px' }}>Cancel</button>
                    <button onClick={handleConfirm} disabled={!title.trim()} style={{ padding: '8px 16px', backgroundColor: '#646cff', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', opacity: !title.trim() ? 0.5 : 1 }}>Create</button>
                </div>
            </div>
        </div>
    );
};

