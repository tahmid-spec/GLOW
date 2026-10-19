export type UserRole = 'sender' | 'receiver';

export interface UserProfile {
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'drawing' | 'listening';
  bio?: string;
  joinedAt: number;
}

export interface InvitationCode {
  code: string; // e.g. "7F3K-9D2P"
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  createdAt: number;
  expiresAt: number; // 10 minutes from creation
  status: 'active' | 'used' | 'cancelled' | 'expired';
}

export interface ConnectionRequest {
  id: string;
  code: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverUsername: string;
  receiverAvatar: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export interface StrokePoint {
  x: number;
  y: number;
}

export interface CanvasStroke {
  points: StrokePoint[];
  color: string;
  size: number;
  isEraser?: boolean;
}

export interface CanvasSticker {
  id: string;
  type: 'heart' | 'star' | 'sparkle' | 'text';
  text?: string;
  x: number;
  y: number;
  scale: number;
  color: string;
  rotation?: number;
}

export interface DoodleItem {
  id: string;
  pairId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title?: string;
  strokes: CanvasStroke[];
  stickers: CanvasSticker[];
  previewUrl: string; // PNG Data URL
  mode: 'direct' | 'canvas'; // 'direct' = Draw for you, 'canvas' = Our shared canvas
  createdAt: number;
}

export interface VoiceMessageItem {
  id: string;
  pairId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  duration: number; // seconds (max 10s)
  audioUrl: string; // data URL or blob
  waveform: number[]; // normalized bars [0.1..1.0]
  createdAt: number;
  listened: boolean;
  listenedAt?: number;
}

export type WidgetTheme = 'midnight' | 'pastel' | 'lavender' | 'sunset';

export interface WidgetPreferences {
  theme: WidgetTheme;
  customNote: string;
  selectedDoodleId?: string;
  hidePersonalContent: boolean;
  showTimestamp: boolean;
  showWalkieTalkie?: boolean;
  widgetLayout?: 'compact' | 'duo' | 'walkie';
}

export interface PrivatePair {
  id: string;
  name: string;
  user1Id: string;
  user2Id: string;
  connectedAt: number;
  widgetPreferences: WidgetPreferences;
  canvasStrokes: CanvasStroke[];
  canvasStickers: CanvasSticker[];
  canvasLastUpdated: number;
}

export type NavigationTab = 'home' | 'canvas' | 'voice' | 'profile';
