import React, { useState, useEffect } from 'react';
import { FiTrash, FiEdit2, FiPlus, FiCode, FiList, FiCheck, FiX } from 'react-icons/fi';
import { InlineEdit } from '../common/InlineEdit';
import { type Message } from './types';

interface MessageInputProps {
    value: string;
    onChange: (value: string) => void;
    onResolveAvatarUrl?: (avatar: string) => string;
    onListAvatars?: () => Promise<string[]>;
}

export const MessageInput: React.FC<MessageInputProps> = ({ value, onChange, onResolveAvatarUrl, onListAvatars }) => {
    const [mode, setMode] = useState<'normal' | 'json'>('normal');
    const [messages, setMessages] = useState<Message[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [availableAvatars, setAvailableAvatars] = useState<string[]>([]);

    // Form State
    const [editForm, setEditForm] = useState<Message>({
        sender: '',
        content: '',
        sendTime: '',
        avatar: '',
        isMe: false,
        is_bot: false
    });

    const existingSenders = Array.from(new Set(messages.map(m => m.sender))).sort();

    useEffect(() => {
        try {
            const parsed = JSON.parse(value || '[]');
            if (Array.isArray(parsed)) {
                setMessages(parsed);
            }
        } catch (e) {
            // Ignore parsing errors from parent if we are in json mode, 
            // but if we are in normal mode, this shouldn't happen unless value is corrupted externally
        }
    }, [value]);

    useEffect(() => {
        if (onListAvatars && mode === 'normal') {
            onListAvatars().then(setAvailableAvatars).catch(console.error);
        }
    }, [onListAvatars, mode]);

    const handleModeSwitch = (newMode: 'normal' | 'json') => {
        if (newMode === 'normal') {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    setMessages(parsed);
                    setMode('normal');
                    setEditingIndex(null);
                } else {
                    alert("Current content is not a valid array.");
                }
            } catch (e) {
                alert("Invalid JSON, cannot switch to normal mode.");
            }
        } else {
            setMode('json');
        }
    };

    const updateMessages = (newMessages: Message[]) => {
        setMessages(newMessages);
        const json = JSON.stringify(newMessages, null, 2);
        onChange(json);
    };

    const handleDelete = (index: number) => {
        const newMessages = [...messages];
        newMessages.splice(index, 1);
        updateMessages(newMessages);
        if (editingIndex === index) {
            setEditingIndex(null);
        }
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setEditForm({ ...messages[index] });
    };

    const handleAdd = () => {
        setEditingIndex(-1); // -1 for new
        setEditForm({
            sender: '',
            content: '',
            sendTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            avatar: '',
            isMe: false,
            is_bot: false
        });
    };

    const handleSave = () => {
        const newMessages = [...messages];
        if (editingIndex === -1) {
            newMessages.push(editForm);
        } else if (editingIndex !== null) {
            newMessages[editingIndex] = editForm;
        }
        updateMessages(newMessages);
        setEditingIndex(null);
    };

    const handleCancel = () => {
        setEditingIndex(null);
    };

    const resolveAvatar = (avatar?: string) => {
        if (!avatar) return null;
        if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
        if (onResolveAvatarUrl) {
            return onResolveAvatarUrl(avatar);
        }
        return avatar;
    };

    const handleContentUpdate = (index: number, newContent: string) => {
        const newMessages = messages.map((msg, i) =>
            i === index ? { ...msg, content: newContent } : msg
        );
        updateMessages(newMessages);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <button
                    onClick={() => handleModeSwitch('normal')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '5px 10px', cursor: 'pointer',
                        backgroundColor: mode === 'normal' ? '#eef' : 'transparent',
                        border: '1px solid #ddd', borderRadius: '4px'
                    }}
                >
                    <FiList /> Normal
                </button>
                <button
                    onClick={() => handleModeSwitch('json')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '5px 10px', cursor: 'pointer',
                        backgroundColor: mode === 'json' ? '#eef' : 'transparent',
                        border: '1px solid #ddd', borderRadius: '4px'
                    }}
                >
                    <FiCode /> JSON
                </button>
            </div>

            {mode === 'json' ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="im-json-input"
                    style={{ flex: 1, width: '100%', fontFamily: 'monospace', padding: '10px', boxSizing: 'border-box' }}
                    rows={20}
                />
            ) : (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {editingIndex !== null ? (
                        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                            <h4 style={{ marginTop: 0 }}>{editingIndex === -1 ? 'Add Message' : 'Edit Message'}</h4>
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
                                    <button onClick={handleCancel} style={{ flex: 1, padding: '8px', backgroundColor: '#ccc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                                        <FiX /> Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {messages.map((msg, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '10px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: 'white' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', marginRight: '10px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {msg.avatar ? (
                                            <img src={resolveAvatar(msg.avatar) || ''} alt={msg.sender} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span>{msg.sender[0]}</span>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                                            <strong style={{ fontSize: '0.9em' }}>{msg.sender}</strong>
                                            {msg.is_bot && <span style={{ fontSize: '0.7em', backgroundColor: '#eee', padding: '1px 4px', borderRadius: '4px' }}>BOT</span>}
                                            <span style={{ fontSize: '0.8em', color: '#888' }}>{msg.sendTime}</span>
                                        </div>
                                        <InlineEdit
                                            value={msg.content}
                                            onSave={(val) => handleContentUpdate(index, val)}
                                            multiline
                                            style={{ fontSize: '0.9em', color: '#555' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button onClick={() => handleEdit(index)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}><FiEdit2 /></button>
                                        <button onClick={() => handleDelete(index)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#d32f2f' }}><FiTrash /></button>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={handleAdd}
                                style={{
                                    width: '100%', padding: '10px',
                                    border: '1px dashed #ccc', borderRadius: '4px',
                                    backgroundColor: 'transparent', color: '#666', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                                }}
                            >
                                <FiPlus /> Add Message
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
