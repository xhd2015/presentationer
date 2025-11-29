import React, { useState, useEffect } from 'react';

interface CreateSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string) => void;
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (isOpen) setName('');
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(name);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '300px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginTop: 0 }}>Create New Session</h3>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Session Name"
                    autoFocus
                    style={{ width: '100%', padding: '8px', marginBottom: '15px', boxSizing: 'border-box' }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirm();
                        if (e.key === 'Escape') onClose();
                    }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', borderRadius: '4px' }}>Cancel</button>
                    <button onClick={handleConfirm} disabled={!name.trim()} style={{ padding: '8px 16px', backgroundColor: '#646cff', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', opacity: !name.trim() ? 0.5 : 1 }}>Create</button>
                </div>
            </div>
        </div>
    );
};

