export enum SkillLevel {
    Beginner = "Beginner",
    Intermediate = "Intermediate",
    Expert = "Expert"
}

export interface Skill {
    id: string;
    name: string;
    level: SkillLevel;
    verified: boolean;
}

export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    category: string;
}

export interface UserProfile {
    id: string;
    name: string;
    location: string;
    skills: Skill[];
    inventory: InventoryItem[];
    readinessScore: number; // 0-100
}

export interface SquadMember {
    id: string;
    name: string;
    role: string;
    status: 'Online' | 'Offline' | 'Safe' | 'Danger';
    distance: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model' | 'system';
    text: string;
    timestamp: Date;
    isOffline?: boolean; // Was this generated in offline mode?
}

export interface PendingAction {
    id: string;
    type: 'ADD_SKILL' | 'ADD_INVENTORY' | 'UPDATE_INFO';
    description: string;
    data: any;
    confidence: number; // AI confidence score
}