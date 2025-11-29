import React from 'react';
import { MessageInput } from './MessageInput';

interface IMEditorCoreProps {
    jsonInput: string;
    onChange: (value: string) => void;
    onResolveAvatarUrl?: (avatarName: string) => string;
    onListAvatars?: () => Promise<string[]>;
    error?: string | null;
}

export const IMEditorCore: React.FC<IMEditorCoreProps> = ({
    jsonInput,
    onChange,
    onResolveAvatarUrl,
    onListAvatars,
    error
}) => {
    return (
        <div className="im-config-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
            <h3>Message Config</h3>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <MessageInput
                    value={jsonInput}
                    onChange={onChange}
                    onResolveAvatarUrl={onResolveAvatarUrl}
                    onListAvatars={onListAvatars}
                />
            </div>
            {error && <div className="im-error">{error}</div>}
        </div>
    );
};

