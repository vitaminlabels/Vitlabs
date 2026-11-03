export enum Sender {
  USER = 'user',
  AI = 'model'
}

export interface ChatMessage {
  id: string;
  role: Sender;
  text: string;
  isCrisisResponse?: boolean;
}

export interface CrisisResource {
  name: string;
  number: string;
  description: string;
}

export enum AppView {
  LANDING = 'landing',
  CHAT = 'chat',
  REFRAME = 'reframe',
  BREATHING = 'breathing',
  MOOD = 'mood',
  GRATITUDE = 'gratitude',
  HISTORY = 'history'
}

export interface ReframeData {
  originalThought: string;
  emotion: string;
  reframedThoughts: string[];
}

export interface MoodLog {
  id: string;
  timestamp: string; // ISO string
  mood: string; // e.g. 'Senang', 'Tenang', 'Cemas', 'Sedih', 'Kesal', 'Lelah'
  emoji: string;
  intensity: number; // 1 to 5
  factors: string[]; // e.g., 'Keluarga', 'Kerjaan', 'Sosial', 'Kesehatan', 'Keuangan', 'Diri Sendiri'
  note?: string;
}

export interface GratitudeEntry {
  id: string;
  timestamp: string; // ISO string
  items: string[]; // The 3 items of gratitude
  note?: string;
}

export interface SavedReframe {
  id: string;
  timestamp: string; // ISO string
  originalThought: string;
  emotion: string;
  distortionType: string;
  explanation: string;
  reframes: string[];
}
