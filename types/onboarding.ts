export interface OnboardingStepItem {
  id: string;
  icon: string;
  badge: string;
  badge_color: string;
  title: string;
  desc: string;
  interactive_type: 'rules_card' | 'buzzer_tester' | 'ai_spark' | 'user_profile';
  bullets: string[];
  cta_text: string;
}

export const DEFAULT_ONBOARDING_STEPS: OnboardingStepItem[] = [
  {
    id: 'step_vibe',
    icon: 'Flame',
    badge: '✨ YENİ NESİL TABU',
    badge_color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    title: 'Sıradan Oyunları Unut!',
    desc: 'DVT Tabu klasik oyunların ötesinde; kahkaha krizleri, yüksek tempo ve arkadaş rekabeti yaşatan bir parti deneyimidir.',
    interactive_type: 'rules_card',
    bullets: [
      '🟢 Ana kelimeyi 5 yasaklı kelimeyi söylemeden anlat',
      '⚡ Doğru bildiğinde +1 Puan kazan, takıldığında Pas de',
      '🏆 Takımını zafere taşı!'
    ],
    cta_text: 'Devam Et',
  },
  {
    id: 'step_buzzer',
    icon: 'Volume2',
    badge: '🚨 İNTERAKTİF TEST',
    badge_color: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    title: 'Kırmızı Buzzer Gücü!',
    desc: 'Rakibin yasaklı kelimeyi söylediği an affetme! Dokunmatik Buzzer ile oyunu anında durdurup ceza yazdırırsın.',
    interactive_type: 'buzzer_tester',
    bullets: [
      '🔴 Dokunarak canlı ses ve titreşimi şimdi dene!',
      '⚡ Rakibe -1 Ceza puanı yazdır',
    ],
    cta_text: 'Harika, Devam!',
  },
  {
    id: 'step_ai',
    icon: 'Sparkles',
    badge: '🤖 GOOGLE GEMINI 3.5',
    badge_color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    title: 'Yapay Zeka & Trend Memeler',
    desc: 'Google Gemini yapay zekası ile istediğin herhangi bir konuda anında deste üret ve 2026 internet trendleriyle yarış.',
    interactive_type: 'ai_spark',
    bullets: [
      '✨ Tek tıkla kişiye özel tematik desteler yarat',
      '🔥 2026 Viral Meme destesiyle eğlenceyi katla',
      '🎙️ Maç sonu yapay zeka analiz raporları'
    ],
    cta_text: 'Son Adıma Geç',
  },
  {
    id: 'step_profile',
    icon: 'Trophy',
    badge: '👑 ARENAYA İLK ADIM',
    badge_color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    title: 'Sahne Senin! Hazır mısın?',
    desc: 'Arenada rakiplerinin ve takım arkadaşlarının göreceği takma adını belirle ve ilk kapışmaya başla!',
    interactive_type: 'user_profile',
    bullets: [],
    cta_text: '⚔️ Arenaya Başla!',
  },
];
