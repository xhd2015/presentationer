import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import './IMThreadGenerator.css';
import { IMEditorCore } from './im/IMEditorCore';
import { IMPreview } from './im/IMPreview';

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

export interface IMThreadGeneratorRef {
    getState: () => string;
}

export interface IMThreadGeneratorProps {
    initialState?: string;
    onResolveAvatarUrl?: (avatarName: string) => string;
    onListAvatars?: () => Promise<string[]>;
    onChange?: (state: string) => void;
}

const IMThreadGenerator = forwardRef<IMThreadGeneratorRef, IMThreadGeneratorProps>(({ initialState, onResolveAvatarUrl, onListAvatars, onChange }, ref) => {
    const [jsonInput, setJsonInput] = useState<string>(initialState || DEFAULT_JSON);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (!Array.isArray(parsed)) throw new Error("Input must be a JSON array.");
            setError(null);
        } catch (e: any) {
            setError(e.message);
        }
        onChange?.(jsonInput);
    }, [jsonInput]);

    useImperativeHandle(ref, () => ({
        getState: () => jsonInput
    }));

    return (
        <div className="im-thread-container">
            <IMEditorCore
                jsonInput={jsonInput}
                onChange={setJsonInput}
                onResolveAvatarUrl={onResolveAvatarUrl}
                onListAvatars={onListAvatars}
                error={error}
            />
            <IMPreview
                jsonInput={jsonInput}
                onResolveAvatarUrl={onResolveAvatarUrl}
            />
        </div>
    );
});

IMThreadGenerator.displayName = 'IMThreadGenerator';

export default IMThreadGenerator;
