export type Language = 'hi' | 'en';

export type ScreenId = 'welcome' | 'map' | 'plan' | 'share' | 'community';

export type AbVariant = 'A' | 'B';

export type ThemeSourceType = 'mitra_school' | 'classroom_hypothesis';

export type TileSize = 'large' | 'medium' | 'compact';

export interface BilingualText {
  hi: string;
  en: string;
}

export interface PlanStep {
  stepNumber: number;
  title: BilingualText;
  detail: BilingualText;
  duration: BilingualText;
}

export interface PeerSolution {
  id: string;
  themeId: string;
  teacherName: BilingualText;
  blockDistrict: BilingualText;
  avatarUrl: string;
  audioDurationSec: number;
  summary: BilingualText;
  transcript: BilingualText;
  helpfulCount: number;
  isUserSubmitted?: boolean;
  recordedAudioUrl?: string;
}

export interface ProblemTheme {
  id: string;
  size: TileSize;
  sourceType: ThemeSourceType;
  commonalityRank: number;
  title: BilingualText;
  shortPrompt: BilingualText;
  contextNote: BilingualText;
  planIntro: BilingualText;
  planSteps: PlanStep[];
}

export interface CommunityStory {
  id: string;
  teacherName: BilingualText;
  blockDistrict: BilingualText;
  avatarUrl: string;
  themeId: string;
  themeLabel: BilingualText;
  storyType: 'solution' | 'plan_tried' | 'challenge_shared';
  headline: BilingualText;
  body: BilingualText;
  timeAgo: BilingualText;
  applauseCount: number;
  hasVoice: boolean;
  audioDurationSec?: number;
  isUserSubmitted?: boolean;
}

export interface DistrictRecognitionEntry {
  id: string;
  rank: number;
  teacherName: BilingualText;
  schoolAndBlock: BilingualText;
  district: BilingualText;
  avatarUrl: string;
  solutionsShared: number;
  teachersHelped: number;
  xp: number;
  streakDays: number;
  weeksCompleted: number;
  honorTitle: BilingualText;
}

export interface TeacherProfile {
  phone: string;
  name: string;
  blockDistrict: string;
  loggedInAt: string;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  prototype_data: true;
  variant: AbVariant;
  eventType:
    | 'session_started'
    | 'variant_switched'
    | 'language_chosen'
    | 'language_switched'
    | 'read_aloud_used'
    | 'login_completed'
    | 'tile_tapped'
    | 'plan_opened'
    | 'plan_scroll_depth'
    | 'voice_button_tapped'
    | 'voice_recording_started'
    | 'voice_recording_completed'
    | 'own_challenge_started'
    | 'own_challenge_completed'
    | 'feed_viewed'
    | 'badge_screen_viewed'
    | 'variant_a_prompt_sent'
    | 'ai_assistant_opened'
    | 'ai_assistant_message_sent';
  screen: ScreenId;
  metadata?: Record<string, string | number | boolean>;
}

export interface TelemetryState {
  sessionId: string;
  prototype_data: true;
  variant: AbVariant;
  initialLanguage: Language;
  currentLanguage: Language;
  languageSwitchCount: number;
  readAloudCount: number;
  mapEnteredAtMs: number | null;
  firstTileTappedId: string | null;
  firstTileTappedLabel: string | null;
  timeToFirstTapMs: number | null;
  tilesTappedTotal: number;
  plansOpenedCount: number;
  maxPlanScrollDepthPct: number;
  voiceButtonTappedCount: number;
  voiceRecordingStartedCount: number;
  voiceRecordingCompletedCount: number;
  ownChallengeStartedCount: number;
  ownChallengeCompletedCount: number;
  timeOnFeedMs: number;
  badgeScreenViews: number;
  aiAssistantQueriesCount: number;
  events: TelemetryEvent[];
}
