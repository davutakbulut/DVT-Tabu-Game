import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL_NAME = 'gemini-3.5-flash';

export async function POST(req: Request) {
  try {
    const { type, context } = await req.json();

    const systemInstruction = (
      "Sen 'DVT Tabu Game' adlı popüler çok oyunculu Tabu oyununun baş yapay zeka danışmanı ve eğlenceli maç spikerisin. " +
      "Kullanıcıya Türkçe, enerjik, yaratıcı ve kesinlikle JSON formatında yanıt ver."
    );

    const prompts: Record<string, string> = {
      daily_recommendation: `
Günün Tarihi: ${new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Son Oyunlar: ${JSON.stringify(context?.recent_stats || { total_games: 12, top_categories: ['Genel Kültür', 'Sinema & Dizi'] })}

Bugün oyuncular için en eğlenceli 3 farklı oyun modu/kategori önerisi ve bugüne özel 1 adet bonus Tabu kartı hazırla.
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
`,
      difficulty_balancer: `
Oda Durumu: ${JSON.stringify(context?.room_state || {})}
Oyun dengesini heyecanlı kılmak için önerilen dinamik kural uyarlaması ver.
SADECE aşağıdaki JSON formatında yanıt ver:
{
  "recommended_adjustment": "Kural dengeleme tavsiyesi",
  "extra_seconds": 15,
  "extra_passes": 1,
  "hype_message": "Kaybeden takımı ateşleyecek spiker cümlesi"
}
`
    };

    const selectedPrompt = prompts[type] || prompts.daily_recommendation;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      contents: [
        {
          parts: [{ text: `${systemInstruction}\n\n${selectedPrompt}` }]
        }
      ],
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

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Gemini API Error: ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText || '{}');

    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
