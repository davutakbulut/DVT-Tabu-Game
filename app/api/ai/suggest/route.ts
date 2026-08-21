import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL_NAME = 'gemini-2.5-flash';

// Server-side in-memory cache for daily insights (valid for 6 hours)
let cachedDailyInsight: { data: any; timestamp: number } | null = null;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

// Curated high-quality fallbacks when Gemini is busy or rate-limited (429)
const FALLBACK_DAILY = {
  date: new Date().toISOString().split('T')[0],
  headline: 'Günün Tabu Arenası: Hızlı ve Zeki Olan Kazanır! 🚀',
  daily_vibe: 'Bugün Genel Kültür ve Sinema kategorilerinde rekor denemesi günü!',
  recommended_modes: [
    {
      title: 'Express Mod (45s)',
      recommended_duration_seconds: 45,
      recommended_pass_limit: 2,
      reason: 'Zamana karşı adrenalin dolu hızlı kapışma.'
    },
    {
      title: 'Strateji Modu (90s)',
      recommended_duration_seconds: 90,
      recommended_pass_limit: 4,
      reason: 'Daha detaylı ipuçları ve geniş anlatım zamanı.'
    }
  ],
  featured_card_of_the_day: {
    main_word: 'YAPAY ZEKA',
    forbidden_words: ['ROBOT', 'ALGORİTMA', 'BİLGİSAYAR', 'GELECEK', 'CHATGPT'],
    category: 'Teknoloji',
    difficulty: 'Orta'
  }
};

const FALLBACK_ANALYSIS = {
  match_headline: 'NEFES KESEN DERBİ: KELİME CANAVARLARI SAHNEDE! 🚀',
  commentary: 'Kusursuz takım iletişimi ve hızlı pas stratejisiyle hak edilmiş muhteşem bir şampiyonluk!',
  mvp_spotlight: 'Gecenin yıldızı anlatıcılar oldu, baskı altında harika kelimeler buldular.',
  key_takeaways: [
    'Rakip takım: Tabu yasaklarına dikkat ederek daha az ceza puanı alabilir.',
    'Kazanan takım: Pas haklarını dengeli kullanarak tempoyu kontrol altında tuttu.'
  ]
};

const FALLBACK_DECK = {
  theme: 'Türk Dizi ve Sinema',
  cards: [
    {
      main_word: 'EZEL',
      forbidden_words: ['RAMİZ DAYI', 'EYŞAN', 'CENGİZ', 'ÖMER', 'İNTİKAM'],
      category: 'Sinema & Dizi',
      difficulty: 'Kolay'
    },
    {
      main_word: 'ŞAHSİYET',
      forbidden_words: ['AGAH BEY', 'HALUK BİLGİNER', 'KATİL', 'ALZHEIMER', 'POLİS'],
      category: 'Sinema & Dizi',
      difficulty: 'Orta'
    },
    {
      main_word: 'GİBİ',
      forbidden_words: ['YILMAZ', 'İLK KAN', 'ERSOY', 'KÖLE', 'KOMEDİ'],
      category: 'Sinema & Dizi',
      difficulty: 'Kolay'
    }
  ]
};

export async function POST(req: Request) {
  try {
    const { type, context, forceRefresh } = await req.json();

    // 1. Check in-memory cache for daily recommendation
    if (type === 'daily_recommendation' && !forceRefresh && cachedDailyInsight) {
      if (Date.now() - cachedDailyInsight.timestamp < CACHE_TTL_MS) {
        return NextResponse.json(cachedDailyInsight.data);
      }
    }

    // If no API key is provided, return rich fallback immediately
    if (!GEMINI_API_KEY) {
      if (type === 'daily_recommendation') return NextResponse.json(FALLBACK_DAILY);
      if (type === 'post_game_analysis') return NextResponse.json(FALLBACK_ANALYSIS);
      if (type === 'generate_deck') return NextResponse.json(FALLBACK_DECK);
    }

    const systemInstruction = (
      "Sen 'DVT Tabu Game' adlı popüler çok oyunculu Tabu oyununun baş yapay zeka danışmanı ve eğlenceli maç spikerisin. " +
      "Kullanıcıya Türkçe, enerjik, yaratıcı ve kesinlikle JSON formatında yanıt ver."
    );

    const prompts: Record<string, string> = {
      daily_recommendation: `
Günün Tarihi: ${new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Bugün oyuncular için en eğlenceli 2 farklı oyun modu/kategori önerisi ve bugüne özel 1 adet bonus Tabu kartı hazırla.
SADECE aşağıdaki JSON şemasında yanıt dön:
{
  "date": "${new Date().toISOString().split('T')[0]}",
  "headline": "Günün AI Oyun Bülteni Başlığı",
  "daily_vibe": "Enerjik kısa motivasyon cümlesi",
  "recommended_modes": [
    {
      "title": "Mod Adı",
      "recommended_duration_seconds": 60,
      "recommended_pass_limit": 2,
      "reason": "Neden bugün bu mod seçilmeli?"
    }
  ],
  "featured_card_of_the_day": {
    "main_word": "ANA KELİME",
    "forbidden_words": ["YASAK1", "YASAK2", "YASAK3", "YASAK4", "YASAK5"],
    "category": "Kategori",
    "difficulty": "Orta"
  }
}
`,
      post_game_analysis: `
Bitmiş Oyun Verileri: ${JSON.stringify(context?.game_data || {})}
Bu maçın sonucunu esprili bir spor spikeri ağzıyla analiz et.
SADECE aşağıdaki JSON formatında yanıt ver:
{
  "match_headline": "Maçın manşeti",
  "commentary": "2-3 cümlelik esprili maç değerlendirmesi",
  "mvp_spotlight": "Maçın yıldızı ve övgüsü",
  "key_takeaways": ["1. İyileştirme veya taktik", "2. İyileştirme veya taktik"]
}
`,
      generate_deck: `
Konu / Tema: "${context?.theme || 'Türk Dizi ve Sinema'}"
İstenen Kart Sayısı: ${context?.count || 3}
Bu tema için rekabetçi Tabu kartları üret. Her kartta 1 ana kelime ve 5 yasaklı kelime olmalıdır.
SADECE aşağıdaki JSON formatında yanıt ver:
{
  "theme": "${context?.theme || 'Özel Deste'}",
  "cards": [
    {
      "main_word": "KELİME",
      "forbidden_words": ["YASAK1", "YASAK2", "YASAK3", "YASAK4", "YASAK5"],
      "category": "${context?.theme || 'Özel'}",
      "difficulty": "Orta"
    }
  ]
}
`
    };

    const selectedPrompt = prompts[type] || prompts.daily_recommendation;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      contents: [{ parts: [{ text: `${systemInstruction}\n\n${selectedPrompt}` }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json'
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // If rate-limited (429) or error from Gemini: Gracefully return fallback 200 OK!
    if (!response.ok) {
      if (type === 'daily_recommendation') return NextResponse.json(FALLBACK_DAILY);
      if (type === 'post_game_analysis') return NextResponse.json(FALLBACK_ANALYSIS);
      if (type === 'generate_deck') return NextResponse.json(FALLBACK_DECK);
      return NextResponse.json(FALLBACK_DAILY);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText || '{}');

    // Cache the daily insight
    if (type === 'daily_recommendation') {
      cachedDailyInsight = { data: parsed, timestamp: Date.now() };
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    // Return graceful fallback on any network or parsing failure
    return NextResponse.json(FALLBACK_DAILY);
  }
}
