import React, { useState, useMemo } from 'react';
import { FiChevronLeft, FiMoreHorizontal } from 'react-icons/fi';
import './IMThreadGenerator.css';

interface Message {
    sender: string;
    content: string;
    sendTime: string;
    avatar?: string;
    isMe?: boolean;
    is_bot?: boolean;
}

const DEFAULT_JSON = `[
  {
    "sender": "Alice",
    "content": "Hey team, we need to discuss the new feature implementation. I think we should start with the backend API design first.",
    "sendTime": "10:00 AM",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    "isMe": false
  },
  {
    "sender": "Bob",
    "content": "I agree. I've already drafted some endpoints. Let me share the doc.",
    "sendTime": "10:05 AM",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    "isMe": true
  },
  {
    "sender": "Charlie",
    "content": "Looks good to me. When can we review it? @Support Bot",
    "sendTime": "10:10 AM",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    "isMe": false
  },
  {
    "sender": "Support Bot",
    "content": "I have scheduled a meeting for 11:00 AM. `+ '`{\\"data\\":\\"success\\"}`' + `",
    "sendTime": "10:11 AM",
    "is_bot": true
  }
]`;

const IMThreadGenerator: React.FC = () => {
    const [jsonInput, setJsonInput] = useState<string>(DEFAULT_JSON);
    const [error, setError] = useState<string | null>(null);

    const messages = useMemo<Message[]>(() => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (!Array.isArray(parsed)) {
                throw new Error("Input must be a JSON array.");
            }
            setError(null);
            return parsed;
        } catch (e: any) {
            setError(e.message);
            return [];
        }
    }, [jsonInput]);

    const rootMessage = messages.length > 0 ? messages[0] : null;
    const replies = messages.length > 1 ? messages.slice(1) : [];

    const uniqueSenderCount = useMemo(() => {
        const senders = new Set(messages.map(m => m.sender));
        return senders.size;
    }, [messages]);

    const renderAvatar = (msg: Message) => (
        <div className="im-avatar">
            {msg.avatar ? (
                <img src={msg.avatar} alt={msg.sender} />
            ) : (
                <div className="im-avatar-placeholder">{msg.sender[0]}</div>
            )}
        </div>
    );

    const renderBotTag = (isBot?: boolean) => {
        if (!isBot) return null;
        return <span className="im-bot-tag">Bot</span>;
    };

    const formatMessageContent = (content: string) => {
        // Split by code blocks (`...`) or mentions (@...)
        const parts = content.split(/(`[^`]+`|@[a-zA-Z0-9_]+)/g);
        return parts.map((part, index) => {
            if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
                return (
                    <span key={index} className="im-inline-code">
                        {part.slice(1, -1)}
                    </span>
                );
            } else if (part.startsWith('@') && part.length > 1) {
                return (
                    <span key={index} className="im-mention">
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <div className="im-thread-container">
            <div className="im-config-panel">
                <h3>Message Config (JSON)</h3>
                <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="im-json-input"
                    rows={20}
                />
                {error && <div className="im-error">{error}</div>}
            </div>
            <div className="im-preview-panel">
                <h3>Preview</h3>
                <div className="im-phone-frame">
                    <div className="im-thread-header">
                        <div className="im-header-left">
                            <FiChevronLeft />
                        </div>
                        <div className="im-header-center">
                            <div className="im-thread-title">Thread</div>
                            <div className="im-thread-subtitle">
                                Following . {uniqueSenderCount} followers
                            </div>
                        </div>
                        <div className="im-header-right">
                            <FiMoreHorizontal />
                        </div>
                    </div>

                    <div className="im-chat-screen">
                        {/* Root Message */}
                        {rootMessage && (
                            <div className="im-message-root">
                                <div className="im-root-header">
                                    {renderAvatar(rootMessage)}
                                    <div className="im-root-info">
                                        <div className="im-sender-row">
                                            <span className="im-sender-name">{rootMessage.sender}</span>
                                            {renderBotTag(rootMessage.is_bot)}
                                        </div>
                                        <span className="im-time">{rootMessage.sendTime}</span>
                                    </div>
                                </div>
                                <div className="im-root-content">
                                    {formatMessageContent(rootMessage.content)}
                                </div>
                                <div className="im-reply-count-divider">
                                    {replies.length} replies
                                </div>
                            </div>
                        )}

                        {/* Replies */}
                        <div className="im-replies-list">
                            {replies.map((msg, index) => (
                                <div key={index} className="im-reply-row">
                                    {renderAvatar(msg)}
                                    <div className="im-reply-body">
                                        <div className="im-reply-header">
                                            <span className="im-sender-name">{msg.sender}</span>
                                            {renderBotTag(msg.is_bot)}
                                            <span className="im-time">{msg.sendTime}</span>
                                        </div>
                                        <div className="im-reply-content">
                                            {formatMessageContent(msg.content)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IMThreadGenerator;
