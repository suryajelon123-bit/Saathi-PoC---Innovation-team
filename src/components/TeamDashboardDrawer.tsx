import { User } from 'firebase/auth';
import {
  Cloud,
  Download,
  LogIn,
  LogOut,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Shuffle,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { VINDHYA_FIELD_QUESTIONS } from '../data/saathiContent';
import {
  TeamCloudSummary,
  fetchTeamCloudSummary,
  isAdminUser,
  signInWithGoogle,
  signOutGoogle,
} from '../services/saathiFirestore';
import { AbVariant, Language, TelemetryState } from '../types';

interface TeamDashboardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  telemetry: TelemetryState;
  cloudUser: User | null;
  onSwitchVariant: (variant: AbVariant) => void;
  onRandomize5050: () => void;
  onResetSession: () => void;
}

export function TeamDashboardDrawer({
  isOpen,
  onClose,
  lang,
  telemetry,
  cloudUser,
  onSwitchVariant,
  onRandomize5050,
  onResetSession,
}: TeamDashboardDrawerProps) {
  const [activeTab, setActiveTab] = useState<'metrics' | 'cloud' | 'questions' | 'events'>('metrics');
  const [cloudSummary, setCloudSummary] = useState<TeamCloudSummary | null>(null);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadCloudSummary = useCallback(async () => {
    if (!cloudUser) {
      setCloudSummary(null);
      return;
    }
    setCloudLoading(true);
    try {
      const summary = await fetchTeamCloudSummary(cloudUser);
      setCloudSummary(summary);
    } catch {
      // Errors logged via handleFirestoreError
    } finally {
      setCloudLoading(false);
    }
  }, [cloudUser]);

  useEffect(() => {
    if (!isOpen) return;
    void loadCloudSummary();
  }, [isOpen, loadCloudSummary]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google sign-in cancelled or failed.');
    }
  };

  const handleExportJson = () => {
    const payload = {
      sessionTelemetry: telemetry,
      firebaseCloudSummary: cloudSummary,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saathi-team-dashboard-${telemetry.sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const adminAccess = isAdminUser(cloudUser);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/45"
      role="dialog"
      aria-modal="true"
      aria-label="Saathi Team Dashboard"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {lang === 'hi' ? 'साथी टीम डैशबोर्ड व Firebase एनालिटिक्स' : 'Team Dashboard & Firebase Analytics'}
            </h2>
            <p className="text-xs text-slate-500 font-mono-tabular mt-0.5">
              prototype_data: true · session: {telemetry.sessionId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close team dashboard"
            className="min-h-[44px] min-w-[44px] rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Firebase Team Cloud Auth Strip */}
        <div className="px-5 py-3 bg-[#EEF6F6] border-b border-[#B6D4D6] flex flex-wrap items-center justify-between gap-2.5">
          {cloudUser ? (
            <>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0D5C63]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="truncate">{cloudUser.email}</span>
                  {adminAccess && (
                    <span className="px-1.5 py-0.5 rounded bg-[#0D5C63] text-white text-[10px]">
                      Team Admin
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600">
                  Firebase Firestore & Analytics live sync active
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void loadCloudSummary()}
                  className="min-h-[36px] px-2.5 py-1 rounded-lg border border-[#0D5C63]/30 bg-white text-xs font-semibold text-[#0D5C63] flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${cloudLoading ? 'animate-spin' : ''}`} />
                  <span>Sync</span>
                </button>
                <button
                  type="button"
                  onClick={() => void signOutGoogle()}
                  className="min-h-[36px] px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">Connect Firebase Team Cloud</p>
                <p className="text-[11px] text-slate-600">
                  Sign in with Google to persist & query live Firestore team metrics
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleGoogleLogin()}
                className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#0D5C63] hover:bg-[#09474D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Google Sign In</span>
              </button>
            </>
          )}
          {authError && <p className="w-full text-xs text-red-700 font-medium">{authError}</p>}
        </div>

        {/* 50/50 Variant Switcher */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">A/B Prototype View</span>
            <button
              type="button"
              onClick={onRandomize5050}
              className="text-xs font-medium text-[#0D5C63] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Assign 50/50</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { id: 'B' as const, label: 'Minimal Voice-First (3 Tabs)' },
              { id: 'A' as const, label: 'Chat Entry (Baseline)' },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onSwitchVariant(v.id)}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold border text-left transition-colors cursor-pointer ${
                  telemetry.variant === v.id
                    ? 'bg-[#0D5C63] text-white border-[#0D5C63]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'metrics' as const, label: 'Session Funnel' },
            { id: 'cloud' as const, label: 'Firebase Cloud' },
            { id: 'questions' as const, label: '5 Field Prompts' },
            { id: 'events' as const, label: `Logs (${telemetry.events.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#0D5C63] text-[#0D5C63]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'metrics' && (
            <div className="grid grid-cols-2 gap-3">
              <MetricBox
                label="Walkthrough / Lang"
                value={`${telemetry.walkthroughStatus} · ${telemetry.currentLanguage.toUpperCase()}`}
              />
              <MetricBox label="Voice Listen (सुनें)" value={`${telemetry.readAloudCount} taps`} />
              <MetricBox
                label="I Solved This Wins"
                value={`${telemetry.winMomentsCount}`}
              />
              <MetricBox
                label="WhatsApp Shares"
                value={`${telemetry.whatsappSharesCount}`}
              />
              <MetricBox
                label="First Problem Tapped"
                value={telemetry.firstTileTappedLabel ?? 'Not tapped yet'}
              />
              <MetricBox
                label="Time to First Tap"
                value={
                  telemetry.timeToFirstTapMs !== null
                    ? `${(telemetry.timeToFirstTapMs / 1000).toFixed(1)}s`
                    : '—'
                }
              />
              <MetricBox
                label="Voice Solution Funnel"
                value={`${telemetry.voiceButtonTappedCount} tap · ${telemetry.voiceRecordingStartedCount} rec · ${telemetry.voiceRecordingCompletedCount} done`}
              />
              <MetricBox
                label="Own Inquiry Funnel"
                value={`${telemetry.ownChallengeStartedCount} start · ${telemetry.ownChallengeCompletedCount} done`}
              />
              <MetricBox
                label="Feed Dwell / Badges"
                value={`${(telemetry.timeOnFeedMs / 1000).toFixed(1)}s · ${telemetry.badgeScreenViews} views`}
              />
              <MetricBox
                label="AI Helper Queries"
                value={`${telemetry.aiAssistantQueriesCount ?? 0}`}
              />
            </div>
          )}

          {activeTab === 'cloud' && (
            <div className="space-y-4">
              {!cloudUser ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center space-y-3">
                  <Cloud className="w-8 h-8 text-[#0D5C63] mx-auto" />
                  <p className="text-sm font-semibold text-slate-900">
                    Sign in with Google above to view live Firestore records
                  </p>
                  <p className="text-xs text-slate-600">
                    All teacher voice solutions, wins, and analytics sync directly to Firestore when signed in.
                  </p>
                </div>
              ) : cloudLoading ? (
                <p className="text-sm text-slate-600">Loading Firestore metrics...</p>
              ) : cloudSummary ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <MetricBox label="Cloud Events Logged" value={`${cloudSummary.totalEvents}`} />
                    <MetricBox label="Cloud Solutions Shared" value={`${cloudSummary.totalSolutions}`} />
                    <MetricBox label="Cloud Listen Taps" value={`${cloudSummary.readAloudCount}`} />
                    <MetricBox label="Cloud Wins / WhatsApp" value={`${cloudSummary.winMomentsCount} / ${cloudSummary.whatsappSharesCount}`} />
                    <MetricBox label="Cloud Voice Recordings" value={`${cloudSummary.voiceCompletedCount}`} />
                    <MetricBox label="Cloud Variant B / A" value={`${cloudSummary.variantBCount} / ${cloudSummary.variantACount}`} />
                  </div>
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-bold text-slate-700">Recent Firestore Events</p>
                    {cloudSummary.recentEvents.map((e) => (
                      <div
                        key={e.id}
                        className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-mono-tabular flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800">
                          [{e.variant}] {e.eventType}
                        </span>
                        <span className="text-slate-500">
                          {e.screen} · {e.lang}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-600">No cloud records yet.</p>
              )}
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Vindhya&apos;s teacher sensing prompts (for field interviews):
              </p>
              <ol className="space-y-2.5">
                {VINDHYA_FIELD_QUESTIONS.map((q) => (
                  <li
                    key={q.number}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {q.number}. {q.questionHi}
                    </p>
                    <p className="text-xs text-slate-600">{q.questionEn}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-2">
              {telemetry.events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-mono-tabular"
                >
                  <div className="flex items-center justify-between text-slate-800 font-semibold">
                    <span>
                      [{evt.variant}] {evt.eventType}
                    </span>
                    <span className="text-slate-500">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-slate-600 mt-1 break-all">
                    screen={evt.screen} · {JSON.stringify(evt.metadata)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
          <button
            type="button"
            onClick={onResetSession}
            className="min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Session</span>
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            className="min-h-[40px] px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl border border-slate-200 bg-white">
      <div className="text-[11px] font-medium text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-900 mt-1 font-mono-tabular break-words">
        {value}
      </div>
    </div>
  );
}
