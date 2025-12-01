import React, { useState, useEffect } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import { type Message } from './types';

interface MessageFormProps {
    initialData: Message;
    onSave: (msg: Message) => void;
    onCancel: () => void;
    isNew: boolean;
    existingSenders: string[];
    availableAvatars: string[];
    onListAvatars?: () => Promise<string[]>;
}

export const MessageForm: React.FC<MessageFormProps> = ({
    initialData,
    onSave,
    onCancel,
    isNew,
    existingSenders,
    availableAvatars: initialAvailableAvatars,
    onListAvatars
}) => {
    const [editForm, setEditForm] = useState<Message>(initialData);
    const [availableAvatars, setAvailableAvatars] = useState<string[]>(initialAvailableAvatars);

    useEffect(() => {
        setEditForm(initialData);
    }, [initialData]);

    useEffect(() => {
        setAvailableAvatars(initialAvailableAvatars);
    }, [initialAvailableAvatars]);

    useEffect(() => {
        if (onListAvatars && availableAvatars.length === 0) {
            onListAvatars().then(setAvailableAvatars).catch(console.error);
        }
    }, [onListAvatars, availableAvatars.length]);

    const handleSave = () => {
        onSave(editForm);
    };

    return (
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fafafa' }}>
            <h4 style={{ marginTop: 0 }}>{isNew ? 'Add Message' : 'Edit Message'}</h4>
            <div style={{ display: 'grid', gap: '10px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Sender</label>
                    <input
                        type="text"
                        list="sender-options"
                        value={editForm.sender}
                        onChange={e => setEditForm({ ...editForm, sender: e.target.value })}
                        style={{ width: '100%', padding: '5px' }}
                        placeholder="Sender name"
                    />
                    <datalist id="sender-options">
                        {existingSenders.map(sender => (
                            <option key={sender} value={sender} />
                        ))}
                    </datalist>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Content</label>
                    <textarea
                        value={editForm.content}
                        onChange={e => setEditForm({ ...editForm, content: e.target.value })}
                        style={{ width: '100%', padding: '5px', minHeight: '60px' }}
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Time</label>
                        <input
                            type="text"
                            value={editForm.sendTime}
                            onChange={e => setEditForm({ ...editForm, sendTime: e.target.value })}
                            style={{ width: '100%', padding: '5px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Avatar (Name or URL)</label>
                        {onListAvatars ? (
                            <>
                                <input
                                    type="text"
                                    list="avatar-options"
                                    value={editForm.avatar || ''}
                                    onChange={e => setEditForm({ ...editForm, avatar: e.target.value })}
                                    style={{ width: '100%', padding: '5px' }}
                                    placeholder="Select or type URL..."
                                />
                                <datalist id="avatar-options">
                                    {availableAvatars.map(name => (
                                        <option key={name} value={name} />
                                    ))}
                                </datalist>
                            </>
                        ) : (
                            <input
                                type="text"
                                value={editForm.avatar || ''}
                                onChange={e => setEditForm({ ...editForm, avatar: e.target.value })}
                                style={{ width: '100%', padding: '5px' }}
                            />
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                            type="checkbox"
                            checked={editForm.isMe || false}
                            onChange={e => setEditForm({ ...editForm, isMe: e.target.checked })}
                        />
                        Is Me
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                            type="checkbox"
                            checked={editForm.is_bot || false}
                            onChange={e => setEditForm({ ...editForm, is_bot: e.target.checked })}
                        />
                        Is Bot
                    </label>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button onClick={handleSave} style={{ flex: 1, padding: '8px', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                        <FiCheck /> Save
                    </button>
                    <button onClick={onCancel} style={{ flex: 1, padding: '8px', backgroundColor: '#ccc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                        <FiX /> Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

