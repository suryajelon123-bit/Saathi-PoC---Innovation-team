import { Compass, Flame, Home, Mic, Trophy } from 'lucide-react';
import { UI_COPY } from '../data/saathiContent';
import { AbVariant, Language, ScreenId } from '../types';

interface TopBarProps {
  lang: Language;
  activeScreen: ScreenId;
  variant: AbVariant;
  isPhoneFrame?: boolean;
  onNavigate: (screen: ScreenId) => void;
  onToggleLanguage: () => void;
}

function getNavItemsForVariant(_variant: AbVariant): {
  id: ScreenId;
  icon: typeof Home;
  label: { hi: string; en: string };
}[] {
  return [
    { id: 'welcome', icon: Home, label: UI_COPY.nav.welcome },
    { id: 'map', icon: Compass, label: UI_COPY.nav.map },
    { id: 'plan', icon: Flame, label: UI_COPY.nav.plan },
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
}: TopBarProps) {
  const navItems = getNavItemsForVariant(variant);

  return (
    <header className="sticky top-0 z-30 h-13 md:h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 shrink-0">
      <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('welcome')}
          className="text-lg md:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-[#0D5C63] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C63] rounded"
        >
          {UI_COPY.brandName[lang]}
        </button>

        {/* Zone 2: 5 concise single-line nav links */}
        {!isPhoneFrame && variant !== 'A' ? (
          <nav
            aria-label={lang === 'hi' ? 'मुख्य नेविगेशन' : 'Primary Navigation'}
            className="hidden md:flex items-center gap-6 text-sm font-medium"
          >
            {navItems.map(({ id, label }) => {
              const isActive = activeScreen === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onNavigate(id)}
                  className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5C63] rounded-t ${
                    isActive
                      ? 'text-[#0D5C63] border-[#0D5C63] font-semibold'
                      : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {label[lang]}
                </button>
              );
            })}
          </nav>
        ) : !isPhoneFrame ? (
          <nav
            aria-label="Variant A Navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <span className="whitespace-nowrap shrink-0 text-slate-500">
              {lang === 'hi' ? 'चैट सहायता प्रवेश (तुलना दृश्य)' : 'Chat Entry Baseline (Comparison)'}
            </span>
          </nav>
        ) : null}

        {/* Zone 3: Single primary action — Language Switch */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onToggleLanguage}
            className="min-h-[40px] px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0D5C63] hover:bg-[#09474D] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0D5C63]"
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
  variant: AbVariant;
  isPhoneFrame?: boolean;
  onNavigate: (screen: ScreenId) => void;
}

export function MobileBottomNav({
  lang,
  activeScreen,
  variant,
  isPhoneFrame = false,
  onNavigate,
}: MobileBottomNavProps) {
  const navItems = getNavItemsForVariant(variant);

  return (
    <nav
      aria-label={lang === 'hi' ? 'मोबाइल नेविगेशन' : 'Mobile Navigation'}
      className={
        isPhoneFrame
          ? 'sticky bottom-0 z-40 h-14 bg-white/95 backdrop-blur-md border-t border-slate-200 shrink-0'
          : 'md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/95 backdrop-blur-md border-t border-slate-200'
      }
    >
      <div className="grid grid-cols-5 h-full">
        {navItems.map(({ id, icon: Icon, label }) => {
          const isActive = activeScreen === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center justify-center min-h-[44px] px-1 transition-colors cursor-pointer ${
                isActive ? 'text-[#0D5C63] font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.25 : 1.75} />
              <span className="text-[10px] leading-tight mt-0.5 whitespace-nowrap truncate max-w-full">
                {label[lang]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
