export interface Message {
    sender: string;
    content: string;
    sendTime: string;
    avatar?: string;
    isMe?: boolean;
    is_bot?: boolean;
}

