import { Download, RotateCcw, Shuffle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { VINDHYA_FIELD_QUESTIONS } from '../data/saathiContent';
import { AbVariant, Language, TelemetryState } from '../types';

interface TelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  telemetry: TelemetryState;
  onSwitchVariant: (variant: AbVariant) => void;
  onRandomize5050: () => void;
  onResetSession: () => void;
}

export function TelemetryDrawer({
  isOpen,
  onClose,
  lang,
  telemetry,
  onSwitchVariant,
  onRandomize5050,
  onResetSession,
}: TelemetryDrawerProps) {
  const [activeTab, setActiveTab] = useState<'metrics' | 'questions' | 'events'>('metrics');

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(telemetry, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saathi-sensing-${telemetry.sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Field Sensing Telemetry"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {lang === 'hi' ? 'फील्ड सेंसिंग टेलीमेट्री व A/B स्विच' : 'Field Sensing Telemetry & A/B Switch'}
            </h2>
            <p className="text-xs text-slate-500 font-mono-tabular mt-0.5">
              prototype_data: true · session: {telemetry.sessionId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close telemetry drawer"
            className="min-h-[44px] min-w-[44px] rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 50/50 Variant Switcher */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">
              50/50 Experiment Variant
            </span>
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
              { id: 'B' as const, label: 'Variant B: Themes + 4-Week Path' },
              { id: 'A' as const, label: 'Variant A: Chat Baseline' },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onSwitchVariant(v.id)}
                className={`min-h-[40px] px-3 py-2 rounded-lg text-xs font-semibold border text-left transition-colors cursor-pointer ${
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
        <div className="px-5 pt-3 border-b border-slate-200 flex items-center gap-2">
          {[
            { id: 'metrics' as const, label: 'Click Telemetry (8)' },
            { id: 'questions' as const, label: 'Dec 1 Field Questions (5)' },
            { id: 'events' as const, label: `Event Log (${telemetry.events.length})` },
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
                label="Language / Switches"
                value={`${telemetry.currentLanguage.toUpperCase()} (${telemetry.languageSwitchCount} switches)`}
              />
              <MetricBox label="Read-Aloud Used" value={`${telemetry.readAloudCount} taps`} />
              <MetricBox
                label="First Tile Tapped"
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
              <MetricBox label="Tiles Tapped Total" value={`${telemetry.tilesTappedTotal}`} />
              <MetricBox
                label="Plans Opened / Max Scroll"
                value={`${telemetry.plansOpenedCount} · ${telemetry.maxPlanScrollDepthPct}%`}
              />
              <MetricBox
                label="Voice Solution Funnel"
                value={`${telemetry.voiceButtonTappedCount} tap · ${telemetry.voiceRecordingStartedCount} start · ${telemetry.voiceRecordingCompletedCount} done`}
              />
              <MetricBox
                label="Own Challenge Funnel"
                value={`${telemetry.ownChallengeStartedCount} start · ${telemetry.ownChallengeCompletedCount} done`}
              />
              <MetricBox
                label="Time on Feed"
                value={`${(telemetry.timeOnFeedMs / 1000).toFixed(1)}s`}
              />
              <MetricBox label="Badge / Leader Views" value={`${telemetry.badgeScreenViews}`} />
              <MetricBox
                label="AI Assistant Queries"
                value={`${telemetry.aiAssistantQueriesCount ?? 0}`}
              />
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Vindhya&apos;s Dec 1 teacher sensing prompts (ask alongside prototype observation):
              </p>
              <ol className="space-y-3">
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
            <span>Export JSON (prototype_data)</span>
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
