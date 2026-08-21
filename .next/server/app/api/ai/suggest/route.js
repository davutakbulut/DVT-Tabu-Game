"use strict";(()=>{var e={};e.id=90,e.ids=[90],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},2205:(e,a,t)=>{t.r(a),t.d(a,{originalPathname:()=>g,patchFetch:()=>A,requestAsyncStorage:()=>k,routeModule:()=>y,serverHooks:()=>_,staticGenerationAsyncStorage:()=>f});var n={};t.r(n),t.d(n,{POST:()=>p});var i=t(9303),r=t(8716),o=t(670),s=t(7070);let d=process.env.GEMINI_API_KEY||"",l=null,m={date:new Date().toISOString().split("T")[0],headline:"G\xfcn\xfcn Tabu Arenası: Hızlı ve Zeki Olan Kazanır! \uD83D\uDE80",daily_vibe:"Bug\xfcn Genel K\xfclt\xfcr ve Sinema kategorilerinde rekor denemesi g\xfcn\xfc!",recommended_modes:[{title:"Express Mod (45s)",recommended_duration_seconds:45,recommended_pass_limit:2,reason:"Zamana karşı adrenalin dolu hızlı kapışma."},{title:"Strateji Modu (90s)",recommended_duration_seconds:90,recommended_pass_limit:4,reason:"Daha detaylı ipu\xe7ları ve geniş anlatım zamanı."}],featured_card_of_the_day:{main_word:"YAPAY ZEKA",forbidden_words:["ROBOT","ALGORİTMA","BİLGİSAYAR","GELECEK","CHATGPT"],category:"Teknoloji",difficulty:"Orta"}},u={match_headline:"NEFES KESEN DERBİ: KELİME CANAVARLARI SAHNEDE! \uD83D\uDE80",commentary:"Kusursuz takım iletişimi ve hızlı pas stratejisiyle hak edilmiş muhteşem bir şampiyonluk!",mvp_spotlight:"Gecenin yıldızı anlatıcılar oldu, baskı altında harika kelimeler buldular.",key_takeaways:["Rakip takım: Tabu yasaklarına dikkat ederek daha az ceza puanı alabilir.","Kazanan takım: Pas haklarını dengeli kullanarak tempoyu kontrol altında tuttu."]},c={theme:"T\xfcrk Dizi ve Sinema",cards:[{main_word:"EZEL",forbidden_words:["RAMİZ DAYI","EYŞAN","CENGİZ","\xd6MER","İNTİKAM"],category:"Sinema & Dizi",difficulty:"Kolay"},{main_word:"ŞAHSİYET",forbidden_words:["AGAH BEY","HALUK BİLGİNER","KATİL","ALZHEIMER","POLİS"],category:"Sinema & Dizi",difficulty:"Orta"},{main_word:"GİBİ",forbidden_words:["YILMAZ","İLK KAN","ERSOY","K\xd6LE","KOMEDİ"],category:"Sinema & Dizi",difficulty:"Kolay"}]};async function p(e){try{let{type:a,context:t,forceRefresh:n}=await e.json();if("daily_recommendation"===a&&!n&&l&&Date.now()-l.timestamp<216e5)return s.NextResponse.json(l.data);if(!d){if("daily_recommendation"===a)return s.NextResponse.json(m);if("post_game_analysis"===a)return s.NextResponse.json(u);if("generate_deck"===a)return s.NextResponse.json(c)}let i={daily_recommendation:`
G\xfcn\xfcn Tarihi: ${new Date().toLocaleDateString("tr-TR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
Bug\xfcn oyuncular i\xe7in en eğlenceli 2 farklı oyun modu/kategori \xf6nerisi ve bug\xfcne \xf6zel 1 adet bonus Tabu kartı hazırla.
SADECE aşağıdaki JSON şemasında yanıt d\xf6n:
{
  "date": "${new Date().toISOString().split("T")[0]}",
  "headline": "G\xfcn\xfcn AI Oyun B\xfclteni Başlığı",
  "daily_vibe": "Enerjik kısa motivasyon c\xfcmlesi",
  "recommended_modes": [
    {
      "title": "Mod Adı",
      "recommended_duration_seconds": 60,
      "recommended_pass_limit": 2,
      "reason": "Neden bug\xfcn bu mod se\xe7ilmeli?"
    }
  ],
  "featured_card_of_the_day": {
    "main_word": "ANA KELİME",
    "forbidden_words": ["YASAK1", "YASAK2", "YASAK3", "YASAK4", "YASAK5"],
    "category": "Kategori",
    "difficulty": "Orta"
  }
}
`,post_game_analysis:`
Bitmiş Oyun Verileri: ${JSON.stringify(t?.game_data||{})}
Bu ma\xe7ın sonucunu esprili bir spor spikeri ağzıyla analiz et.
SADECE aşağıdaki JSON formatında yanıt ver:
{
  "match_headline": "Ma\xe7ın manşeti",
  "commentary": "2-3 c\xfcmlelik esprili ma\xe7 değerlendirmesi",
  "mvp_spotlight": "Ma\xe7ın yıldızı ve \xf6vg\xfcs\xfc",
  "key_takeaways": ["1. İyileştirme veya taktik", "2. İyileştirme veya taktik"]
}
`,generate_deck:`
Konu / Tema: "${t?.theme||"T\xfcrk Dizi ve Sinema"}"
İstenen Kart Sayısı: ${t?.count||3}
Bu tema i\xe7in rekabet\xe7i Tabu kartları \xfcret. Her kartta 1 ana kelime ve 5 yasaklı kelime olmalıdır.
SADECE aşağıdaki JSON formatında yanıt ver:
{
  "theme": "${t?.theme||"\xd6zel Deste"}",
  "cards": [
    {
      "main_word": "KELİME",
      "forbidden_words": ["YASAK1", "YASAK2", "YASAK3", "YASAK4", "YASAK5"],
      "category": "${t?.theme||"\xd6zel"}",
      "difficulty": "Orta"
    }
  ]
}
`},r=i[a]||i.daily_recommendation,o=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${d}`,p={contents:[{parts:[{text:`Sen 'DVT Tabu Game' adlı pop\xfcler \xe7ok oyunculu Tabu oyununun baş yapay zeka danışmanı ve eğlenceli ma\xe7 spikerisin. Kullanıcıya T\xfcrk\xe7e, enerjik, yaratıcı ve kesinlikle JSON formatında yanıt ver.

${r}`}]}],generationConfig:{temperature:.7,responseMimeType:"application/json"}},y=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)});if(!y.ok){if("daily_recommendation"===a)return s.NextResponse.json(m);if("post_game_analysis"===a)return s.NextResponse.json(u);if("generate_deck"===a)return s.NextResponse.json(c);return s.NextResponse.json(m)}let k=await y.json(),f=k?.candidates?.[0]?.content?.parts?.[0]?.text,_=JSON.parse(f||"{}");return"daily_recommendation"===a&&(l={data:_,timestamp:Date.now()}),s.NextResponse.json(_)}catch(e){return s.NextResponse.json(m)}}let y=new i.AppRouteRouteModule({definition:{kind:r.x.APP_ROUTE,page:"/api/ai/suggest/route",pathname:"/api/ai/suggest",filename:"route",bundlePath:"app/api/ai/suggest/route"},resolvedPagePath:"/Users/davutakbulut/Documents/antigravity/calm-salk/app/api/ai/suggest/route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:k,staticGenerationAsyncStorage:f,serverHooks:_}=y,g="/api/ai/suggest/route";function A(){return(0,o.patchFetch)({serverHooks:_,staticGenerationAsyncStorage:f})}}};var a=require("../../../../webpack-runtime.js");a.C(e);var t=e=>a(a.s=e),n=a.X(0,[948,972],()=>t(2205));module.exports=n})();