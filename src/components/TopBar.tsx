import { Compass, HelpCircle, Mic, Trophy } from 'lucide-react';
import { UI_COPY } from '../data/saathiContent';
import { AbVariant, Language, ScreenId } from '../types';

interface TopBarProps {
  lang: Language;
  activeScreen: ScreenId;
  variant: AbVariant;
  isPhoneFrame?: boolean;
  onNavigate: (screen: ScreenId) => void;
  onToggleLanguage: () => void;
  onReplayWalkthrough?: () => void;
}

function getThreeTabs(): {
  id: ScreenId;
  icon: typeof Compass;
  label: { hi: string; en: string };
}[] {
  return [
    { id: 'map', icon: Compass, label: UI_COPY.nav.map },
    { id: 'share', icon: Mic, label: UI_COPY.nav.share },
    { id: 'community', icon: Trophy, label: UI_COPY.nav.community },
  ];
}

export function TopBar({
  lang,
  activeScreen,
  variant,
  isPhoneFrame = false,
  onNavigate,
  onToggleLanguage,
  onReplayWalkthrough,
}: TopBarProps) {
  const navItems = getThreeTabs();
  const isMapOrPlan = activeScreen === 'map' || activeScreen === 'plan';

  return (
    <header className="sticky top-0 z-30 h-13 md:h-15 bg-white border-b border-slate-200 shrink-0">
      <div className="max-w-5xl mx-auto h-full px-3.5 sm:px-6 flex items-center justify-between gap-3">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate(variant === 'A' ? 'welcome' : 'map')}
          className="text-lg md:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-[#0D5C63] transition-colors cursor-pointer"
        >
          {UI_COPY.brandName[lang]}
        </button>

        {/* Zone 2: Strictly 3 clear tabs on desktop (no 4-Week Path clutter) */}
        {!isPhoneFrame && variant !== 'A' ? (
          <nav
            aria-label={lang === 'hi' ? 'मुख्य नेविगेशन' : 'Primary Navigation'}
            className="hidden md:flex items-center gap-6 text-sm font-medium"
          >
            {navItems.map(({ id, label }) => {
              const isActive = id === 'map' ? isMapOrPlan : activeScreen === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onNavigate(id)}
                  className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
                    isActive
                      ? 'text-[#0D5C63] border-[#0D5C63] font-bold'
                      : 'text-slate-600 border-transparent hover:text-slate-900'
                  }`}
                >
                  {label[lang]}
                </button>
              );
            })}
          </nav>
        ) : !isPhoneFrame ? (
          <span className="hidden md:inline text-xs font-medium text-slate-500">
            {lang === 'hi' ? 'चैट तुलना दृश्य' : 'Chat Comparison Baseline'}
          </span>
        ) : null}

        {/* Zone 3: Language Toggle + optional Walkthrough help */}
        <div className="flex items-center gap-2 shrink-0">
          {onReplayWalkthrough && variant !== 'A' && (
            <button
              type="button"
              onClick={onReplayWalkthrough}
              aria-label={lang === 'hi' ? 'ऐप गाइड देखें' : 'Show 3-step guide'}
              title={lang === 'hi' ? '3-कदम गाइड' : '3-Step Guide'}
              className="min-h-[40px] min-w-[40px] rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="min-h-[40px] px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0D5C63] hover:bg-[#09474D] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {UI_COPY.langToggle[lang]}
          </button>
        </div>
      </div>
    </header>
  );
}

interface MobileBottomNavProps {
  lang: Language;
  activeScreen: ScreenId;
  isPhoneFrame?: boolean;
  onNavigate: (screen: ScreenId) => void;
}

export function MobileBottomNav({
  lang,
  activeScreen,
  isPhoneFrame = false,
  onNavigate,
}: MobileBottomNavProps) {
  const navItems = getThreeTabs();
  const isMapOrPlan = activeScreen === 'map' || activeScreen === 'plan';

  return (
    <nav
      aria-label={lang === 'hi' ? 'मोबाइल नेविगेशन' : 'Mobile Navigation'}
      className={
        isPhoneFrame
          ? 'sticky bottom-0 z-40 h-15 bg-white border-t border-slate-200 shrink-0'
          : 'md:hidden fixed bottom-0 left-0 right-0 z-40 h-15 bg-white border-t border-slate-200'
      }
    >
      <div className="grid grid-cols-3 h-full">
        {navItems.map(({ id, icon: Icon, label }) => {
          const isActive = id === 'map' ? isMapOrPlan : activeScreen === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center justify-center min-h-[48px] px-2 transition-colors cursor-pointer ${
                isActive ? 'text-[#0D5C63] font-bold bg-[#EEF6F6]/60' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.4 : 1.8} />
              <span className="text-[11px] leading-tight mt-1 whitespace-nowrap truncate max-w-full">
                {label[lang]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
