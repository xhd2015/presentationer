import React, { useMemo, useState, useCallback } from 'react';
import { FiChevronLeft, FiMoreHorizontal } from 'react-icons/fi';
import { PreviewContainer } from '../common/PreviewContainer';
import { type Message } from './types';
import '../IMThreadGenerator.css';

interface IMPreviewProps {
    jsonInput: string;
    onResolveAvatarUrl?: (avatarName: string) => string;
    exportWidth?: string;
    exportHeight?: string;
    onDimensionsChange?: (width: number, height: number) => void;
}

export const IMPreview: React.FC<IMPreviewProps> = ({
    jsonInput,
    onResolveAvatarUrl,
    exportWidth,
    exportHeight,
    onDimensionsChange
}) => {
    // Initialize visual state to default 425x800, immune to exportWidth/Height inputs
    const [visualWidth, setVisualWidth] = useState(425);
    const [visualHeight, setVisualHeight] = useState(800);

    const messages = useMemo<Message[]>(() => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (!Array.isArray(parsed)) return [];
            return parsed;
        } catch {
            return [];
        }
    }, [jsonInput]);

    const rootMessage = messages.length > 0 ? messages[0] : null;
    const replies = messages.length > 1 ? messages.slice(1) : [];
    const uniqueSenderCount = useMemo(() => new Set(messages.map(m => m.sender)).size, [messages]);

    const resolveAvatar = (avatar?: string) => {
        if (!avatar) return null;
        if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
        return onResolveAvatarUrl ? onResolveAvatarUrl(avatar) : avatar;
    };

    const renderAvatar = (msg: Message) => {
        const avatarSrc = resolveAvatar(msg.avatar);
        return (
            <div className="im-avatar">
                {avatarSrc ? <img src={avatarSrc} alt={msg.sender} /> : <div className="im-avatar-placeholder">{msg.sender[0]}</div>}
            </div>
        );
    };

    const renderBotTag = (isBot?: boolean) => isBot ? <span className="im-bot-tag">Bot</span> : null;

    const formatMessageContent = (content: string) => {
        const parts = content.split(/(`[^`]+`|@[a-zA-Z0-9_]+)/g);
        return parts.map((part, index) => {
            if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
                return <span key={index} className="im-inline-code">{part.slice(1, -1)}</span>;
            } else if (part.startsWith('@') && part.length > 1) {
                return <span key={index} className="im-mention">{part}</span>;
            }
            return part;
        });
    };

    const innerStyle = {
        width: `${visualWidth}px`,
        height: `${visualHeight}px`
    };

    const handleDimensionsChange = useCallback((w: number, h: number) => {
        setVisualWidth(w);
        setVisualHeight(h);
        onDimensionsChange?.(w, h);
    }, [onDimensionsChange]);

    return (
        <PreviewContainer
            title="Preview"
            style={innerStyle}
            exportWidth={exportWidth}
            exportHeight={exportHeight}
            onDimensionsChange={handleDimensionsChange}
        >
            <div className="im-phone-frame">
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
                            <div className="im-root-content">{formatMessageContent(rootMessage.content)}</div>
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
                                    <div className="im-reply-content">{formatMessageContent(msg.content)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PreviewContainer>
    );
};

