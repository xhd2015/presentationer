import React from 'react';
import { FiEdit2, FiTrash, FiPlus } from 'react-icons/fi';
import { InlineEdit } from '../common/InlineEdit';
import { type Message } from './types';

interface MessageListProps {
    messages: Message[];
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
    onAdd: () => void;
    onContentUpdate: (index: number, content: string) => void;
    onResolveAvatarUrl?: (avatar: string) => string;
}

export const MessageList: React.FC<MessageListProps> = ({
    messages,
    onEdit,
    onDelete,
    onAdd,
    onContentUpdate,
    onResolveAvatarUrl
}) => {
    const resolveAvatar = (avatar?: string) => {
        if (!avatar) return null;
        if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
        if (onResolveAvatarUrl) {
            return onResolveAvatarUrl(avatar);
        }
        return avatar;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg, index) => {
                if (!msg) return null;
                const senderName = msg.sender || '?';
                return (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '10px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: 'white' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', marginRight: '10px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {msg.avatar ? (
                                <img src={resolveAvatar(msg.avatar) || ''} alt={senderName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span>{senderName[0]}</span>
                            )}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                                <strong style={{ fontSize: '0.9em' }}>{senderName}</strong>
                                {msg.is_bot && <span style={{ fontSize: '0.7em', backgroundColor: '#eee', padding: '1px 4px', borderRadius: '4px' }}>BOT</span>}
                                <span style={{ fontSize: '0.8em', color: '#888' }}>{msg.sendTime}</span>
                            </div>
                            <InlineEdit
                                value={msg.content}
                                onSave={(val) => onContentUpdate(index, val)}
                                multiline
                                style={{ fontSize: '0.9em', color: '#555' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => onEdit(index)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}><FiEdit2 /></button>
                            <button onClick={() => onDelete(index)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#d32f2f' }}><FiTrash /></button>
                        </div>
                    </div>
                );
            })}
            <button
                onClick={onAdd}
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
    );
};

