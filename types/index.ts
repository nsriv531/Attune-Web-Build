// types/index.ts

export type Subject = {
  id: string;
  name: string;
  color: string;
  sessionCount: number;
};

export type RitualSound = 'lofi' | 'rain' | 'forest' | 'white-noise' | 'silence';

export type SessionDuration = number;

export type FocusFeeling = 'solid' | 'good' | 'rough';
export type ReflectionReason = 'distraction' | 'tired' | 'busy' | 'other';

export type DistractionLog = {
  timeLeft: number;
  timeCameBack: number;
  distractionTime: number;
};

// Alias for backward compatibility if needed in stores
export type DistractionEvent = {
  timestamp: number;
  type: 'app-switch' | 'idle' | 'scroll-burst';
  durationSeconds: number;
};

export type Session = {
  _id: string;
  userId: string;
  subject?: string;
  subjectId?: string;
  plannedDuration?: number;
  timeOverall: number;
  compiledDistractionTime: number;
  categoryMusic?: string;
  breakTime?: number;
  resumeTime?: number;
  focusScore: number;
  distractionLogs: DistractionLog[];
  startedAt: number;
};


export type SoliState = 'idle' | 'watching' | 'nudge' | 'alert' | 'celebrate';

export type Avatar = {
  userId: string;
  animalType: 'cat' | 'dog' | 'fox' | 'bear' | 'rabbit' | 'koala';
  hairColor: 'black' | 'brown' | 'blonde' | 'red' | 'blue' | 'pink' | 'white';
  skinColor: 'fair' | 'tan' | 'brown' | 'dark';
  hat: 'none' | 'cap' | 'beanie' | 'crown' | 'wizard';
  clothing: 'none' | 'shirt' | 'hoodie' | 'scarf';
  accessory: 'none' | 'glasses' | 'sunglasses' | 'monocle';
};

export type Subscription = {
  userId: string;
  platform: 'ios' | 'android';
  productId: string;
  originalTransactionId: string;
  status: 'active' | 'expired' | 'grace_period';
  startDate: number;
  endDate: number;
};

export type SageState = 'idle' | 'watching' | 'nudge' | 'alert' | 'celebrate' | 'excessive_celebration';

export type User = {
  _id: string;
  name: string;
  email: string;
  tokenIdentifier: string;
  age: number;
  spotifyId?: string;
  xpScore: number;
  coins: number;
  unlockedItems: string[];
  equippedItems: any; // Or a more specific type
  streakDays?: number;
  totalSessions?: number;
  lastSessionDate?: string;
  avatar?: Avatar;
  isPremium: boolean;
};

export type Feedback = {
  sessionId: string;
  userId: string;
  rating: number; // 1-4
  comment?: string;
};

export type SweetSpot = {
  bestDuration: number;
  avgFocus: number;
};

export type PeakDaysHours = {
  heatmap: number[][]; // 7x24 grid
};

export type AIInsight = {
  id: string;
  type: 'peak-window' | 'sweet-spot' | 'distraction' | 'subject' | 'streak';
  title: string;
  body: string;
  tag: string;
  tagColor: 'purple' | 'green' | 'amber';
};

export type SmartSuggestion = {
  message: string;
  pills: Array<{ label: string }>;
};

export type Resource = {
  _id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  externalId?: string;
  publishedAt: number;
};
