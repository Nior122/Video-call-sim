export interface Persona {
  id: string;
  name: string;
  slug: string;
  description: string;
  profileImage: string | null;
  coverImage: string | null;
  gallery: string | null;

  isAdult: boolean;
  age: number | null;
  city: string | null;
  country: string | null;
  occupation: string | null;
  
  shortBio: string | null;
  longBio: string | null;

  personality: string;
  background: string;
  interests: string;
  hobbies: string | null;
  likes: string | null;
  dislikes: string | null;
  
  speakingStyle: string;
  communicationTone: string | null;
  flirtLevel: number;
  emojiFrequency: string | null;

  systemPrompt?: string; // Hidden on client for security
  active: boolean;
  createdAt: string;
  updatedAt: string;
  videos?: PersonaVideo[];
}

export interface PersonaVideo {
  id: string;
  personaId: string;
  url: string;
  title: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatReaction {
  emoji: string;
  by: "user" | "assistant";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: "sent" | "seen";
  seenAt?: Date;
  reactions?: ChatReaction[];
  attachmentUrl?: string;
  attachmentType?: "image" | "video" | "file";
  attachmentName?: string;
}

export type CallState = 
  | "IDLE"
  | "CONNECTING"
  | "CONNECTED"
  | "VIDEO_LOADING"
  | "VIDEO_PLAYING"
  | "VIDEO_BUFFERING"
  | "VIDEO_ERROR"
  | "WAITING_FOR_NEXT_CLIP"
  | "ENDING"
  | "ENDED";

export const CALL_CONFIG = {
  minimumVideoDuration: 60,
  maximumVideoDuration: 180,
  videoTransitionDelayMin: 1000,
  videoTransitionDelayMax: 3000,
};
