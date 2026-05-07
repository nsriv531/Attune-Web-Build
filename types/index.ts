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

export type DistractionEvent = {
  timestamp: number;
  type: 'app-switch' | 'idle' | 'scroll-burst';
  durationSeconds: number;
};

export type Session = {
  id: string;
  subject: string;
  subjectId: string;
  durationMinutes: number;
  startedAt: number;
  endedAt?: number;
  focusScore: number;
  distractionEvents: DistractionEvent[];
  feeling?: FocusFeeling;
  reflectionNote?: string;
  xpEarned: number;
  completed: boolean;
};

export type SageState = 'idle' | 'watching' | 'nudge' | 'alert' | 'celebrate';

export type AvatarLevel = {
  level: number;
  xpRequired: number;
  name: string;
  unlocks: string[];
};

export type HeatmapCell = {
  dayIndex: number;   // 0 = Mon, 6 = Sun
  hourIndex: number;  // 0 = 8am slot
  intensity: number;  // 0–1
  sessionCount: number;
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

export type UserProfile = {
  id: string;
  name: string;
  streakDays: number;
  totalXp: number;
  avatarLevel: number;
  totalSessions: number;
  joinedAt: number;
};
