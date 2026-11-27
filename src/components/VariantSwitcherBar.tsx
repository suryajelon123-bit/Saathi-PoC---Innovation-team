import { Mic, MessageSquare, Monitor, Smartphone } from 'lucide-react';
import { AbVariant, Language } from '../types';

interface VariantSwitcherBarProps {
  lang: Language;
  variant: AbVariant;
  phonePreview: boolean;
  onSelectVariant: (variant: AbVariant) => void;
  onTogglePhonePreview: () => void;
}

const VARIANTS: {
  id: AbVariant;
  icon: typeof Mic;
  label: { hi: string; en: string };
  hypothesis: { hi: string; en: string };
}[] = [
  {
    id: 'B',
    icon: Mic,
    label: { hi: 'साथी आवाज़-प्रथम (3 टैब)', en: 'Saathi Voice-First (3 Tabs)' },
    hypothesis: {
      hi: 'सीधे समस्याएँ → आवाज़ सुनें → 1-टैप "मैंने हल किया" व WhatsApp साझा',
      en: 'Straight to problems → listen by voice → 1-tap "I solved this" & WhatsApp',
    },
  },
  {
    id: 'A',
    icon: MessageSquare,
    label: { hi: 'चैट तुलना', en: 'Chat Baseline' },
    hypothesis: {
      hi: 'तुलना दृश्य: सीधा सवाल-जवाब चैट बॉक्स',
      en: 'Comparison view: direct open chat entry',
    },
  },
];

export function VariantSwitcherBar({
  lang,
  variant,
  phonePreview,
  onSelectVariant,
  onTogglePhonePreview,
}: VariantSwitcherBarProps) {
  const activeMeta = VARIANTS.find((v) => v.id === variant) ?? VARIANTS[0];

  return (
    <div className="bg-slate-100 border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-1.5 flex items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label={lang === 'hi' ? 'प्रोडक्ट वेरिएंट चयन' : 'Product Flow Variants'}
          className="flex items-center gap-1.5 overflow-x-auto"
        >
          {VARIANTS.map((v) => {
            const Icon = v.icon;
            const active = variant === v.id;
            return (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelectVariant(v.id)}
                className={`min-h-[34px] px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{v.label[lang]}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-3 min-w-0">
          <p className="text-xs text-slate-600 truncate max-w-md">{activeMeta.hypothesis[lang]}</p>
          <button
            type="button"
            onClick={onTogglePhonePreview}
            className={`hidden lg:inline-flex min-h-[34px] px-3 py-1 rounded-lg border text-xs font-semibold items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              phonePreview
                ? 'bg-[#0D5C63] text-white border-[#0D5C63]'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {phonePreview ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span>
              {phonePreview
                ? lang === 'hi'
                  ? 'पूर्ण स्क्रीन'
                  : 'Full Width'
                : lang === 'hi'
                ? 'फ़ोन दृश्य (390px)'
                : 'Phone View (390px)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
