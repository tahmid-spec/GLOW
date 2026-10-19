import { 
  UserProfile, 
  InvitationCode, 
  ConnectionRequest, 
  PrivatePair, 
  DoodleItem, 
  VoiceMessageItem,
  WidgetPreferences,
  CanvasStroke,
  CanvasSticker
} from '../types';

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'candle_current_user_id',
  USERS: 'candle_users',
  INVITATIONS: 'candle_invitations',
  REQUESTS: 'candle_requests',
  PAIRS: 'candle_pairs',
  DOODLES: 'candle_doodles',
  VOICE_MESSAGES: 'candle_voice_messages',
  INITIALIZED: 'candle_initialized_v2'
};

// Default seed users matching the visual specification and mockup
export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user_tahmid',
    displayName: 'Tahmid',
    username: '@tahmid',
    avatar: '🐱',
    status: 'online',
    bio: 'Drawing little things for you',
    joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 7
  },
  {
    id: 'user_rafi',
    displayName: 'Rafi',
    username: '@rafi',
    avatar: '🦊',
    status: 'online',
    bio: 'Listening to your voice notes ✨',
    joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 7
  }
];

export const DEFAULT_PAIR_ID = 'pair_tahmid_rafi';

// Initial preloaded doodles from mockup
const SEED_DOODLES: DoodleItem[] = [
  {
    id: 'doodle_seed_1',
    pairId: DEFAULT_PAIR_ID,
    authorId: 'user_tahmid',
    authorName: 'Tahmid',
    authorAvatar: '🐱',
    title: 'Better together',
    strokes: [
      {
        points: [{ x: 50, y: 120 }, { x: 70, y: 80 }, { x: 95, y: 110 }, { x: 120, y: 140 }, { x: 95, y: 170 }, { x: 50, y: 120 }],
        color: '#F5A8D0',
        size: 4
      },
      {
        points: [{ x: 260, y: 100 }, { x: 275, y: 80 }, { x: 290, y: 100 }, { x: 305, y: 120 }, { x: 275, y: 140 }, { x: 260, y: 100 }],
        color: '#79E6DF',
        size: 3.5
      }
    ],
    stickers: [
      { id: 's1', type: 'sparkle', x: 70, y: 60, scale: 1, color: '#79E6DF' },
      { id: 's2', type: 'sparkle', x: 240, y: 70, scale: 0.8, color: '#FFE28A' },
      { id: 's3', type: 'star', x: 280, y: 155, scale: 0.9, color: '#FFE28A' },
      { id: 's4', type: 'text', text: 'Better', x: 145, y: 95, scale: 1.2, color: '#F8F6FC' },
      { id: 's5', type: 'text', text: 'together ♡', x: 130, y: 130, scale: 1.2, color: '#F8F6FC' }
    ],
    previewUrl: '', // Generated dynamically
    mode: 'canvas',
    createdAt: Date.now() - 1000 * 60 * 45 // 45m ago
  },
  {
    id: 'doodle_seed_2',
    pairId: DEFAULT_PAIR_ID,
    authorId: 'user_rafi',
    authorName: 'Rafi',
    authorAvatar: '🦊',
    title: "you're special",
    strokes: [
      {
        points: [{ x: 120, y: 100 }, { x: 150, y: 60 }, { x: 180, y: 100 }, { x: 150, y: 140 }, { x: 120, y: 100 }],
        color: '#F5A8D0',
        size: 5
      }
    ],
    stickers: [
      { id: 's6', type: 'star', x: 90, y: 150, scale: 1, color: '#FFE28A' },
      { id: 's7', type: 'text', text: "you're special", x: 110, y: 180, scale: 1.1, color: '#BBA2FF' },
      { id: 's8', type: 'heart', x: 220, y: 200, scale: 0.9, color: '#F5A8D0' }
    ],
    previewUrl: '',
    mode: 'direct',
    createdAt: Date.now() - 1000 * 60 * 12 // 12m ago
  }
];

// Initial preloaded voice notes
const SEED_VOICE_NOTES: VoiceMessageItem[] = [
  {
    id: 'voice_seed_1',
    pairId: DEFAULT_PAIR_ID,
    senderId: 'user_rafi',
    senderName: 'Rafi',
    senderAvatar: '🦊',
    duration: 8,
    audioUrl: '', // Synthetic warm chime audio synthesized on demand
    waveform: [0.15, 0.35, 0.6, 0.85, 0.7, 0.45, 0.9, 0.75, 0.5, 0.65, 0.8, 0.95, 0.6, 0.4, 0.3, 0.5, 0.7, 0.85, 0.5, 0.3, 0.2, 0.4, 0.6, 0.3],
    createdAt: Date.now() - 1000 * 60 * 2, // 2m ago
    listened: false
  },
  {
    id: 'voice_seed_2',
    pairId: DEFAULT_PAIR_ID,
    senderId: 'user_tahmid',
    senderName: 'Tahmid',
    senderAvatar: '🐱',
    duration: 6,
    audioUrl: '',
    waveform: [0.2, 0.4, 0.6, 0.8, 0.7, 0.5, 0.75, 0.65, 0.5, 0.4, 0.6, 0.75, 0.8, 0.5, 0.3, 0.2, 0.35, 0.5, 0.4, 0.2],
    createdAt: Date.now() - 1000 * 60 * 15, // 15m ago
    listened: true,
    listenedAt: Date.now() - 1000 * 60 * 10
  }
];

class CandleStorage {
  private syncChannel: BroadcastChannel | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.syncChannel = new BroadcastChannel('candle_sync');
        this.syncChannel.onmessage = () => {
          this.notify();
        };
      } catch {
        // Fallback if BroadcastChannel unavailable
      }
      this.init();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  private broadcast() {
    if (this.syncChannel) {
      try {
        this.syncChannel.postMessage({ type: 'UPDATE', timestamp: Date.now() });
      } catch {}
    }
    this.notify();
  }

  public init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'user_tahmid');

      const initialPair: PrivatePair = {
        id: DEFAULT_PAIR_ID,
        name: 'Our Glow',
        user1Id: 'user_tahmid',
        user2Id: 'user_rafi',
        connectedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
        widgetPreferences: {
          theme: 'midnight',
          customNote: 'miss you',
          hidePersonalContent: false,
          showTimestamp: true
        },
        canvasStrokes: [],
        canvasStickers: [],
        canvasLastUpdated: Date.now()
      };

      localStorage.setItem(STORAGE_KEYS.PAIRS, JSON.stringify([initialPair]));
      localStorage.setItem(STORAGE_KEYS.DOODLES, JSON.stringify(SEED_DOODLES));
      localStorage.setItem(STORAGE_KEYS.VOICE_MESSAGES, JSON.stringify(SEED_VOICE_NOTES));
      localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  // Current User
  public getCurrentUserId(): string {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'user_tahmid';
  }

  public setCurrentUserId(userId: string) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    this.broadcast();
  }

  public getCurrentUser(): UserProfile {
    const currentId = this.getCurrentUserId();
    const users = this.getUsers();
    return users.find(u => u.id === currentId) || users[0] || DEFAULT_USERS[0];
  }

  public updateCurrentUser(updates: Partial<UserProfile>) {
    const currentId = this.getCurrentUserId();
    const users = this.getUsers().map(u => u.id === currentId ? { ...u, ...updates } : u);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.broadcast();
  }

  public getUsers(): UserProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : DEFAULT_USERS;
  }

  // Active Pair for the current user
  public getMyPair(): { pair: PrivatePair | null; partner: UserProfile | null } {
    const currentId = this.getCurrentUserId();
    const pairs: PrivatePair[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAIRS) || '[]');
    const pair = pairs.find(p => p.user1Id === currentId || p.user2Id === currentId) || null;

    if (!pair) return { pair: null, partner: null };

    const partnerId = pair.user1Id === currentId ? pair.user2Id : pair.user1Id;
    const users = this.getUsers();
    const partner = users.find(u => u.id === partnerId) || null;

    return { pair, partner };
  }

  // Disconnect Pair
  public disconnectPair(pairId: string) {
    let pairs: PrivatePair[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAIRS) || '[]');
    pairs = pairs.filter(p => p.id !== pairId);
    localStorage.setItem(STORAGE_KEYS.PAIRS, JSON.stringify(pairs));
    this.broadcast();
  }

  // Connect / Restore Default Demo Pair
  public connectDefaultPair(): { pair: PrivatePair; partner: UserProfile } {
    let pairs: PrivatePair[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAIRS) || '[]');
    let pair = pairs.find(p => 
      (p.user1Id === 'user_tahmid' && p.user2Id === 'user_rafi') ||
      (p.user1Id === 'user_rafi' && p.user2Id === 'user_tahmid')
    );

    if (!pair) {
      pair = {
        id: DEFAULT_PAIR_ID,
        name: 'Our Glow',
        user1Id: 'user_tahmid',
        user2Id: 'user_rafi',
        connectedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
        widgetPreferences: {
          theme: 'midnight',
          customNote: 'miss you',
          hidePersonalContent: false,
          showTimestamp: true,
          showWalkieTalkie: true
        },
        canvasStrokes: [],
        canvasStickers: [],
        canvasLastUpdated: Date.now()
      };
      pairs.unshift(pair);
      localStorage.setItem(STORAGE_KEYS.PAIRS, JSON.stringify(pairs));
    }

    this.broadcast();
    return this.getMyPair() as any;
  }

  // Invitation Codes
  public generateInvitationCode(): InvitationCode {
    const user = this.getCurrentUser();
    // 8 characters formatted as XXXX-XXXX using cryptographically secure random values
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude confusing chars like 0/O, 1/I
    let codeStr = '';
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    for (let i = 0; i < 8; i++) {
      codeStr += chars[array[i] % chars.length];
    }
    const formattedCode = `${codeStr.slice(0, 4)}-${codeStr.slice(4)}`;

    const newCode: InvitationCode = {
      code: formattedCode,
      creatorId: user.id,
      creatorName: user.displayName,
      creatorUsername: user.username,
      creatorAvatar: user.avatar,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
      status: 'active'
    };

    const invites = this.getInvitations();
    // Cancel prior active invites for this user
    const updated = invites.map(inv => inv.creatorId === user.id && inv.status === 'active' ? { ...inv, status: 'cancelled' as const } : inv);
    updated.unshift(newCode);
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(updated));
    this.broadcast();
    return newCode;
  }

  public getInvitations(): InvitationCode[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVITATIONS);
    return raw ? JSON.parse(raw) : [];
  }

  public cancelInvitation(code: string) {
    const invites = this.getInvitations().map(inv => inv.code === code ? { ...inv, status: 'cancelled' as const } : inv);
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invites));
    this.broadcast();
  }

  // Enter Invitation Code (Receiver creates connection request)
  public submitInvitationCode(code: string): { success: boolean; error?: string; request?: ConnectionRequest } {
    const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const formatted = normalized.length === 8 ? `${normalized.slice(0, 4)}-${normalized.slice(4)}` : normalized;
    const currentUser = this.getCurrentUser();

    const invites = this.getInvitations();
    const matched = invites.find(inv => inv.code.replace('-', '') === normalized);

    if (!matched) {
      return { success: false, error: 'Invalid invitation code. Please check and try again.' };
    }

    if (matched.creatorId === currentUser.id) {
      return { success: false, error: 'You cannot connect with your own invitation code.' };
    }

    if (matched.status === 'cancelled') {
      return { success: false, error: 'This invitation code was cancelled by the sender.' };
    }

    if (matched.status === 'used') {
      return { success: false, error: 'This invitation code has already been used.' };
    }

    if (Date.now() > matched.expiresAt || matched.status === 'expired') {
      return { success: false, error: 'This invitation code has expired (10 min limit).' };
    }

    // Check if receiver is already connected to someone
    const myPair = this.getMyPair();
    if (myPair.pair) {
      return { success: false, error: 'You already have an active private pair. Disconnect first to connect with someone else.' };
    }

    // Create Connection Request for the sender to approve
    const requests = this.getConnectionRequests();
    const newRequest: ConnectionRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      code: matched.code,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      senderUsername: currentUser.username,
      senderAvatar: currentUser.avatar,
      receiverId: matched.creatorId,
      receiverName: matched.creatorName,
      receiverUsername: matched.creatorUsername,
      receiverAvatar: matched.creatorAvatar,
      status: 'pending',
      createdAt: Date.now()
    };

    requests.unshift(newRequest);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));

    // Mark code as used/pending
    matched.status = 'used';
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invites));

    this.broadcast();
    return { success: true, request: newRequest };
  }

  public getConnectionRequests(): ConnectionRequest[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return raw ? JSON.parse(raw) : [];
  }

  // Accept Connection Request -> Establish Private Pair
  public acceptConnectionRequest(requestId: string): { success: boolean; pair?: PrivatePair } {
    const requests = this.getConnectionRequests();
    const reqIndex = requests.findIndex(r => r.id === requestId);
    if (reqIndex === -1) return { success: false };

    const req = requests[reqIndex];
    req.status = 'accepted';
    requests[reqIndex] = req;
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));

    // Create the new Private Pair
    const newPair: PrivatePair = {
      id: `pair_${Date.now()}`,
      name: 'Our Glow',
      user1Id: req.receiverId,
      user2Id: req.senderId,
      connectedAt: Date.now(),
      widgetPreferences: {
        theme: 'midnight',
        customNote: 'miss you',
        hidePersonalContent: false,
        showTimestamp: true
      },
      canvasStrokes: [],
      canvasStickers: [],
      canvasLastUpdated: Date.now()
    };

    const pairs: PrivatePair[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAIRS) || '[]');
    // Disconnect any existing pairs for either user to maintain strictly 2-person rule
    const filteredPairs = pairs.filter(p => 
      p.user1Id !== req.receiverId && p.user2Id !== req.receiverId &&
      p.user1Id !== req.senderId && p.user2Id !== req.senderId
    );
    filteredPairs.unshift(newPair);
    localStorage.setItem(STORAGE_KEYS.PAIRS, JSON.stringify(filteredPairs));

    this.broadcast();
    return { success: true, pair: newPair };
  }

  public rejectConnectionRequest(requestId: string) {
    const requests = this.getConnectionRequests();
    const updated = requests.map(r => r.id === requestId ? { ...r, status: 'rejected' as const } : r);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(updated));
    this.broadcast();
  }

  // Doodles
  public getDoodles(pairId?: string): DoodleItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DOODLES);
    const doodles: DoodleItem[] = raw ? JSON.parse(raw) : [];
    if (pairId) {
      return doodles.filter(d => d.pairId === pairId);
    }
    return doodles;
  }

  public addDoodle(doodle: Omit<DoodleItem, 'id' | 'createdAt'>): DoodleItem {
    const newDoodle: DoodleItem = {
      ...doodle,
      id: `doodle_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now()
    };
    const doodles = this.getDoodles();
    doodles.unshift(newDoodle);
    localStorage.setItem(STORAGE_KEYS.DOODLES, JSON.stringify(doodles));

    // If it's canvas mode, also update the pair's canvas session
    if (doodle.mode === 'canvas') {
      this.updatePairCanvas(doodle.pairId, doodle.strokes, doodle.stickers);
    }

    this.broadcast();
    return newDoodle;
  }

  public updatePairCanvas(pairId: string, strokes: CanvasStroke[], stickers: CanvasSticker[]) {
    const pairs: PrivatePair[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAIRS) || '[]');
    const idx = pairs.findIndex(p => p.id === pairId);
    if (idx !== -1) {
      pairs[idx].canvasStrokes = strokes;
      pairs[idx].canvasStickers = stickers;
      pairs[idx].canvasLastUpdated = Date.now();
      localStorage.setItem(STORAGE_KEYS.PAIRS, JSON.stringify(pairs));
    }
  }

  // Voice Messages
  public getVoiceMessages(pairId?: string): VoiceMessageItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.VOICE_MESSAGES);
    const msgs: VoiceMessageItem[] = raw ? JSON.parse(raw) : [];
    if (pairId) {
      return msgs.filter(m => m.pairId === pairId);
    }
    return msgs;
  }

  public addVoiceMessage(msg: Omit<VoiceMessageItem, 'id' | 'createdAt' | 'listened'>): VoiceMessageItem {
    const newMsg: VoiceMessageItem = {
      ...msg,
      id: `voice_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      listened: false
    };
    const list = this.getVoiceMessages();
    list.unshift(newMsg);
    localStorage.setItem(STORAGE_KEYS.VOICE_MESSAGES, JSON.stringify(list));
    this.broadcast();
    return newMsg;
  }

  public markVoiceMessageListened(msgId: string) {
    const list = this.getVoiceMessages();
    const idx = list.findIndex(m => m.id === msgId);
    if (idx !== -1 && !list[idx].listened) {
      list[idx].listened = true;
      list[idx].listenedAt = Date.now();
      localStorage.setItem(STORAGE_KEYS.VOICE_MESSAGES, JSON.stringify(list));
      this.broadcast();
    }
  }

  // Widget Preferences
  public updateWidgetPreferences(pairId: string, prefs: Partial<WidgetPreferences>) {
    const pairs: PrivatePair[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAIRS) || '[]');
    const idx = pairs.findIndex(p => p.id === pairId);
    if (idx !== -1) {
      pairs[idx].widgetPreferences = {
        ...pairs[idx].widgetPreferences,
        ...prefs
      };
      localStorage.setItem(STORAGE_KEYS.PAIRS, JSON.stringify(pairs));
      this.broadcast();
    }
  }

  // Reset to initial demo state
  public resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    this.init();
    this.broadcast();
  }
}

export const storage = new CandleStorage();
