import React, { useState, useEffect } from 'react';
import { ConfigEditor } from '../common/ConfigEditor';
import { type Message } from './types';
import { MessageForm } from './MessageForm';
import { MessageList } from './MessageList';

interface MessageInputProps {
    value: string;
    onChange: (value: string) => void;
    onResolveAvatarUrl?: (avatar: string) => string;
    onListAvatars?: () => Promise<string[]>;
}

export const MessageInput: React.FC<MessageInputProps> = ({ value, onChange, onResolveAvatarUrl, onListAvatars }) => {
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
            // Ignore parsing errors from parent
        }
    }, [value]);

    useEffect(() => {
        if (onListAvatars) {
            onListAvatars().then(setAvailableAvatars).catch(console.error);
        }
    }, [onListAvatars]);

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

    const handleSave = (msg: Message) => {
        const newMessages = [...messages];
        if (editingIndex === -1) {
            newMessages.push(msg);
        } else if (editingIndex !== null) {
            newMessages[editingIndex] = msg;
        }
        updateMessages(newMessages);
        setEditingIndex(null);
    };

    const handleCancel = () => {
        setEditingIndex(null);
    };

    const handleContentUpdate = (index: number, newContent: string) => {
        const newMessages = messages.map((msg, i) =>
            i === index ? { ...msg, content: newContent } : msg
        );
        updateMessages(newMessages);
    };

    return (
        <ConfigEditor
            value={value}
            onChange={onChange}
            validateJson={(json) => {
                if (!Array.isArray(json)) return "Current content is not a valid array.";
                return null;
            }}
            onModeChange={(mode) => {
                if (mode === 'normal') {
                    setEditingIndex(null);
                }
            }}
            renderUI={() => (
                <div style={{ padding: '10px' }}>
                    {editingIndex !== null ? (
                        <MessageForm
                            initialData={editForm}
                            onSave={handleSave}
                            onCancel={handleCancel}
                            isNew={editingIndex === -1}
                            existingSenders={existingSenders}
                            availableAvatars={availableAvatars}
                            onListAvatars={onListAvatars}
                        />
                    ) : (
                        <MessageList
                            messages={messages}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onAdd={handleAdd}
                            onContentUpdate={handleContentUpdate}
                            onResolveAvatarUrl={onResolveAvatarUrl}
                        />
                    )}
                </div>
            )}
        />
    );
};
