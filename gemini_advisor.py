#!/usr/bin/env python3
"""
🎮 DVT Tabu Game - Gemini AI Advisor & Game Optimization Engine
Google Gemini API Entegrasyonu ile Günlük AI Öneri Motoru, Oyun Analizörü ve Deste Üreteci
"""

import os
import json
import urllib.request
import urllib.error
from datetime import datetime

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")
MODEL_NAME = "gemini-3.6-flash"

def generate_ai_insight(prompt_type: str, context: dict = None) -> dict:
    """
    Gemini API'sine bağlanıp Tabu oyunu için analiz ve öneri üretir.
    Türler:
      - 'daily_recommendation': Günün modları, bülteni ve öne çıkan kartı
      - 'post_game_analysis': Maç sonu spiker yorumu ve MVP analizi
      - 'generate_deck': Özel tema için 1 ana + 5 yasaklı kelimeden oluşan Tabu kartları
      - 'difficulty_balancer': Takım performansına göre dinamik kural/süre dengeleme
    """
    if context is None:
        context = {}

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={GEMINI_API_KEY}"

    system_instruction = (
        "Sen 'DVT Tabu Game' adlı popüler çok oyunculu Tabu oyununun baş yapay zeka danışmanı ve enerjik maç spikerisin. "
        "Kullanıcıya Türkçe, eğlenceli, yaratıcı ve kesinlikle geçerli JSON formatında yanıt ver."
    )

    prompts = {
        "daily_recommendation": f"""
Günün Tarihi: {datetime.now().strftime('%Y-%m-%d %A')}
Veritabanı Son Oyun İstatistikleri: {json.dumps(context.get('recent_stats', {
    'total_games_today': 18,
    'top_categories': ['Genel Kültür', 'Sinema & Dizi', 'Teknoloji'],
    'average_score_per_team': 9.2,
    'most_passed_word': 'Kuantum Fiziği',
    'fastest_guessed_word': 'Lahmacun'
}), ensure_ascii=False)}

Bugün oyuncular için en eğlenceli ve rekabetçi 3 farklı oyun modu/kategori önerisi hazırla.
Ayrıca bugüne özel 1 adet eğlenceli bonus Tabu kartı önerisi ekle.

SADECE aşağıdaki JSON şemasında yanıt dön:
{{
  "date": "{datetime.now().strftime('%Y-%m-%d')}",
  "headline": "Günün AI Oyun Bülteni Başlığı",
  "daily_vibe": "Enerjik kısa motivasyon cümlesi",
  "recommended_modes": [
    {{
      "title": "Mod/Kategori Adı",
      "recommended_duration_seconds": 60,
      "recommended_pass_limit": 2,
      "reason": "Neden bugün bu mod seçilmeli?"
    }}
  ],
  "featured_card_of_the_day": {{
    "main_word": "ANA KELİME",
    "forbidden_words": ["YASAK1", "YASAK2", "YASAK3", "YASAK4", "YASAK5"],
    "category": "Kategori",
    "difficulty": "Orta"
  }}
}}
""",
        "post_game_analysis": f"""
Bitmiş Oyun Verileri: {json.dumps(context.get('game_data', {
    'teams': [
        {'name': 'Mavi Şimşekler', 'score': 19, 'correct': 19, 'pass_count': 3, 'buzzer_count': 0},
        {'name': 'Kırmızı Ejderler', 'score': 15, 'correct': 16, 'pass_count': 5, 'buzzer_count': 2}
    ],
    'duration_seconds': 600,
    'total_rounds': 6,
    'mvp_player': 'Davut (11 doğru)'
}), ensure_ascii=False)}

Bu maçın sonucunu esprili bir spor spikeri ağzıyla analiz et.
SADECE aşağıdaki JSON formatında yanıt ver:
{{
  "match_headline": "Maçın manşeti",
  "commentary": "2-3 cümlelik esprili ve detaylı maç değerlendirmesi",
  "mvp_spotlight": "Maçın yıldızı ve övgüsü",
  "key_takeaways": ["1. İyileştirme veya taktik", "2. İyileştirme veya taktik"]
}}
""",
        "generate_deck": f"""
Konu / Tema: "{context.get('theme', 'Türk Mutfağı ve Sokak Lezzetleri')}"
İstenen Kart Sayısı: {context.get('count', 3)}

Bu tema için harika, rekabetçi ve güncel Tabu kartları üret. Her kartta kesinlikle 1 ana kelime ve 5 yasaklı kelime olmalıdır.
SADECE aşağıdaki JSON formatında yanıt ver:
{{
  "theme": "{context.get('theme', 'Türk Mutfağı ve Sokak Lezzetleri')}",
  "cards": [
    {{
      "main_word": "KELİME",
      "forbidden_words": ["YASAK1", "YASAK2", "YASAK3", "YASAK4", "YASAK5"],
      "category": "Yemek & Mutfak",
      "difficulty": "Orta"
    }}
  ]
}}
""",
        "difficulty_balancer": f"""
Oda Durumu: {json.dumps(context.get('room_state', {
    'current_score_gap': 8,
    'losing_team': 'Kırmızı Ejderler',
    'winning_team': 'Mavi Şimşekler',
    'rounds_left': 2
}), ensure_ascii=False)}

Oyun dengesini heyecanlı kılmak için önerilen dinamik kural uyarlaması (Örn: Geri düşen takıma +15sn veya +1 pas joker hakkı).
SADECE aşağıdaki JSON formatında yanıt ver:
{{
  "recommended_adjustment": "Kural dengeleme tavsiyesi",
  "extra_seconds": 15,
  "extra_passes": 1,
  "hype_message": "Kaybeden takımı ateşleyecek spiker cümlesi"
}}
"""
    }

    selected_prompt = prompts.get(prompt_type, prompts["daily_recommendation"])

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"{system_instruction}\n\n{selected_prompt}"}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "responseMimeType": "application/json"
        }
    }

    req_data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=req_data,
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            raw_text = res_json["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(raw_text)
    except urllib.error.HTTPError as e:
        return {"error": f"HTTP Error {e.code}: {e.read().decode('utf-8')}"}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    print("=" * 60)
    print("🎮 DVT TABU GAME - GEMINI AI ADVISOR CANLI TESTİ")
    print("=" * 60)
    
    print("\n1. 📊 Günlük Oyun Önerisi & AI Bülteni:")
    daily = generate_ai_insight("daily_recommendation")
    print(json.dumps(daily, indent=2, ensure_ascii=False))

    print("\n2. 🎙️ Oyun Sonu AI Spiker Analizi:")
    game_analysis = generate_ai_insight("post_game_analysis")
    print(json.dumps(game_analysis, indent=2, ensure_ascii=False))

    print("\n3. 🃏 Gemini ile Özel Tabu Destesi Üretimi:")
    custom_deck = generate_ai_insight("generate_deck", {"theme": "Netflix ve Türk Dizileri", "count": 2})
    print(json.dumps(custom_deck, indent=2, ensure_ascii=False))
