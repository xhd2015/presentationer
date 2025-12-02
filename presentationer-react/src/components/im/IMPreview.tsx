import React, { useMemo } from 'react';
import { FiChevronLeft, FiMoreHorizontal } from 'react-icons/fi';
import { type Message } from './types';
import '../IMThreadGenerator.css';

interface IMPreviewProps {
    jsonInput: string;
    onResolveAvatarUrl?: (avatarName: string) => string;
    // Props below are handled by parent PreviewContainer
    exportWidth?: string;
    exportHeight?: string;
    onDimensionsChange?: (width: number, height: number) => void;
}

export const IMPreview: React.FC<IMPreviewProps> = ({
    jsonInput,
    onResolveAvatarUrl,
}) => {
    const messages = useMemo<Message[]>(() => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (!Array.isArray(parsed)) return [];
            return parsed.filter(m => m && typeof m === 'object');
        } catch {
            return [];
        }
    }, [jsonInput]);

    const rootMessage = messages.length > 0 ? messages[0] : null;
    const replies = messages.length > 1 ? messages.slice(1) : [];
    const uniqueSenderCount = useMemo(() => new Set(messages.map(m => m.sender)).size, [messages]);

    const senders = useMemo(() => getSortedSenders(messages), [messages]);

    const renderAvatar = (msg: Message) => {
        if (!msg) return null;
        const avatarSrc = resolveAvatarUrl(msg.avatar, onResolveAvatarUrl);
        const senderName = msg.sender || '?';
        return (
            <div className="im-avatar">
                {avatarSrc ? <img src={avatarSrc} alt={senderName} /> : <div className="im-avatar-placeholder">{senderName[0]}</div>}
            </div>
        );
    };

    const renderBotTag = (isBot?: boolean) => isBot ? <span className="im-bot-tag">Bot</span> : null;

    return (
        <div className="im-phone-frame" style={{ width: '100%', height: '100%' }}>
            <div className="im-thread-header">
                <div className="im-header-left"><FiChevronLeft /></div>
                <div className="im-header-center">
                    <div className="im-thread-title">Thread</div>
                    <div className="im-thread-subtitle">Following • {uniqueSenderCount} followers</div>
                </div>
                <div className="im-header-right"><FiMoreHorizontal /></div>
            </div>
            <div className="im-chat-screen">
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
                        <div className="im-root-content">{formatMessageContent(rootMessage.content, senders)}</div>
                        <div className="im-reply-count-divider">{replies.length} replies</div>
                    </div>
                )}
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
                                <div className="im-reply-content">{formatMessageContent(msg.content, senders)}</div>
                                {index < replies.length - 1 && <div className="im-message-divider"></div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

function getSortedSenders(messages: Message[]): string[] {
    const s = new Set<string>();
    messages.forEach(m => {
        if (m.sender) s.add(m.sender);
    });
    // Sort by length descending to ensure longest match first
    return Array.from(s).sort((a, b) => b.length - a.length);
}

function resolveAvatarUrl(avatar: string | undefined, onResolve?: (name: string) => string): string | null {
    if (!avatar) return null;
    if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
    return onResolve ? onResolve(avatar) : avatar;
}

function formatMessageContent(content: string, senders: string[]) {
    if (!content) return null;

    const escapedSenders = senders.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    // Build regex pattern:
    // 1. Inline code: `...`
    // 2. Known senders: @Name (longest first)
    // 3. Generic mentions: @... (fallback)
    const patterns: string[] = [];
    patterns.push('`[^`]+`');
    if (escapedSenders.length > 0) {
        patterns.push(`@(?:${escapedSenders.join('|')})`);
    }
    patterns.push('@[a-zA-Z0-9_]+');

    const regex = new RegExp(`(${patterns.join('|')})`, 'g');
    const parts = content.split(regex);

    return parts.map((part, index) => {
        if (!part) return null;
        if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
            return <span key={index} className="im-inline-code">{part.slice(1, -1)}</span>;
        } else if (part.startsWith('@') && part.length > 1) {
            return <span key={index} className="im-mention">{part}</span>;
        }
        return part;
    });
}
