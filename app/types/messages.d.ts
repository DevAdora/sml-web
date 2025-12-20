// types/messaging.ts

export interface Profile {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    bio?: string;
}

export interface Conversation {
    id: string;
    participant: Profile;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

export interface MessageProfile {
    username: string;
    full_name: string;
    avatar_url?: string;
}

export interface Message {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    profiles: MessageProfile;
    isTemp?: boolean;
}

export interface User {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    bio?: string;
}