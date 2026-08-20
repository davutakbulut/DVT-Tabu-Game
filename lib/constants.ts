import { Card, GameSettings, Category } from '@/types/game';

export const CATEGORIES: Category[] = [
  'Genel Kültür',
  'Sinema & Dizi',
  'Spor',
  'Teknoloji',
  'Yemek & Mutfak',
  'Seyahat & Coğrafya',
  'Tarih',
  'Müzik & Sanat',
  'Bilim & Doğa',
  '90lar & 2000ler'
];

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  'Genel Kültür': { bg: 'from-blue-600 to-indigo-700', text: 'text-blue-500', border: 'border-blue-500/30', badge: 'bg-blue-500/20 text-blue-400' },
  'Sinema & Dizi': { bg: 'from-purple-600 to-pink-700', text: 'text-purple-500', border: 'border-purple-500/30', badge: 'bg-purple-500/20 text-purple-400' },
  'Spor': { bg: 'from-emerald-600 to-teal-700', text: 'text-emerald-500', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-400' },
  'Teknoloji': { bg: 'from-cyan-600 to-blue-700', text: 'text-cyan-500', border: 'border-cyan-500/30', badge: 'bg-cyan-500/20 text-cyan-400' },
  'Yemek & Mutfak': { bg: 'from-amber-600 to-orange-700', text: 'text-amber-500', border: 'border-amber-500/30', badge: 'bg-amber-500/20 text-amber-400' },
  'Seyahat & Coğrafya': { bg: 'from-emerald-600 to-green-800', text: 'text-green-500', border: 'border-green-500/30', badge: 'bg-green-500/20 text-green-400' },
  'Tarih': { bg: 'from-rose-600 to-red-800', text: 'text-rose-500', border: 'border-rose-500/30', badge: 'bg-rose-500/20 text-rose-400' },
  'Müzik & Sanat': { bg: 'from-fuchsia-600 to-pink-800', text: 'text-fuchsia-500', border: 'border-fuchsia-500/30', badge: 'bg-fuchsia-500/20 text-fuchsia-400' },
  'Bilim & Doğa': { bg: 'from-teal-600 to-emerald-800', text: 'text-teal-500', border: 'border-teal-500/30', badge: 'bg-teal-500/20 text-teal-400' },
  '90lar & 2000ler': { bg: 'from-violet-600 to-indigo-900', text: 'text-violet-500', border: 'border-violet-500/30', badge: 'bg-violet-500/20 text-violet-400' },
};

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  team_count: 2,
  turn_duration: 60,
  total_rounds: 6,
  pass_limit: 3,
  buzzer_penalty: -1,
  correct_points: 1,
  target_score: null,
  categories: ['Genel Kültür', 'Sinema & Dizi', 'Spor', 'Teknoloji', 'Yemek & Mutfak', '90lar & 2000ler'],
  difficulty: 'Tümü',
  deck_id: null,
};

export const INITIAL_CARDS: Card[] = [
  // Genel Kültür
  { id: 'c1', main_word: 'PİRAMİT', forbidden_words: ['MISIR', 'FİRAVUN', 'ÜÇGEN', 'KEOPS', 'TARİH'], category: 'Genel Kültür', difficulty: 'Kolay', language: 'tr' },
  { id: 'c2', main_word: 'EYFEL KULESİ', forbidden_words: ['PARİS', 'FRANSA', 'DEMİR', 'TURİST', 'ŞEHİR'], category: 'Genel Kültür', difficulty: 'Kolay', language: 'tr' },
  { id: 'c3', main_word: 'ANITKABİR', forbidden_words: ['ATATÜRK', 'ANKARA', 'MEZAR', 'ASLANLI YOL', 'MOZOLE'], category: 'Genel Kültür', difficulty: 'Kolay', language: 'tr' },
  { id: 'c4', main_word: 'GÖBEKLİTEPE', forbidden_words: ['ŞANLIURFA', 'TARİH', 'TAPINAK', 'KAZI', 'ARKEOLOJİ'], category: 'Genel Kültür', difficulty: 'Orta', language: 'tr' },
  { id: 'c5', main_word: 'KAPADOKYA', forbidden_words: ['BALON', 'PERİ BACASI', 'NEVŞEHİR', 'KAYA', 'TURİZM'], category: 'Genel Kültür', difficulty: 'Kolay', language: 'tr' },
  { id: 'c6', main_word: 'BOĞAZİÇİ', forbidden_words: ['İSTANBUL', 'KÖPRÜ', 'DENİZ', 'MARMARA', 'YALI'], category: 'Genel Kültür', difficulty: 'Kolay', language: 'tr' },
  { id: 'c7', main_word: 'PUSULA', forbidden_words: ['YÖN', 'KUZEY', 'GÜNEY', 'MANYETİK', 'HARİTA'], category: 'Genel Kültür', difficulty: 'Kolay', language: 'tr' },
  { id: 'c8', main_word: 'TELESKOP', forbidden_words: ['UZAY', 'YILDIZ', 'GEZEGEN', 'GÖKYÜZÜ', 'MERCEK'], category: 'Genel Kültür', difficulty: 'Kolay', language: 'tr' },
  { id: 'c9', main_word: 'KÜTÜPHANE', forbidden_words: ['KİTAP', 'OKUMAK', 'SESSİZ', 'RAF', 'ÖDÜNÇ'], category: 'Genel Kültür', difficulty: 'Kolay', language: 'tr' },
  { id: 'c10', main_word: 'NOTER', forbidden_words: ['İMZA', 'ONAY', 'VEKALET', 'RESMİ', 'TASDİK'], category: 'Genel Kültür', difficulty: 'Orta', language: 'tr' },
  
  // Teknoloji
  { id: 'c11', main_word: 'YAPAY ZEKA', forbidden_words: ['ROBOT', 'ALGORİTMA', 'BİLGİSAYAR', 'GELECEK', 'CHATGPT'], category: 'Teknoloji', difficulty: 'Kolay', language: 'tr' },
  { id: 'c12', main_word: 'AKILLI TELEFON', forbidden_words: ['EKRAN', 'DOKUNMATİK', 'ŞARJ', 'UYGULAMA', 'APPLE'], category: 'Teknoloji', difficulty: 'Kolay', language: 'tr' },
  { id: 'c13', main_word: 'KABLOSUZ KULAKLIK', forbidden_words: ['BLUETOOTH', 'MÜZİK', 'SES', 'KULAK', 'KUTU'], category: 'Teknoloji', difficulty: 'Kolay', language: 'tr' },
  { id: 'c14', main_word: 'BULUT DEPOLAMA', forbidden_words: ['İNTERNET', 'DRIVE', 'DOSYA', 'YEDEK', 'SUNUCU'], category: 'Teknoloji', difficulty: 'Orta', language: 'tr' },
  { id: 'c15', main_word: 'BLOKZİNCİR', forbidden_words: ['BİTCOİN', 'KRİPTO', 'ZİNCİR', 'GÜVENLİK', 'MADENCİLİK'], category: 'Teknoloji', difficulty: 'Zor', language: 'tr' },
  { id: 'c16', main_word: 'DİZÜSTÜ BİLGİSAYAR', forbidden_words: ['LAPTOP', 'KLAVYE', 'BATARYA', 'EKRAN', 'ÇANTA'], category: 'Teknoloji', difficulty: 'Kolay', language: 'tr' },
  { id: 'c17', main_word: 'ALGORİTMA', forbidden_words: ['KOD', 'YAZILIM', 'MANTIK', 'ADIM', 'PROGRAM'], category: 'Teknoloji', difficulty: 'Orta', language: 'tr' },
  { id: 'c18', main_word: 'VİRAL', forbidden_words: ['VİDEO', 'İNTERNET', 'TREND', 'PAYLAŞIM', 'SOSYAL MEDYA'], category: 'Teknoloji', difficulty: 'Orta', language: 'tr' },
  { id: 'c19', main_word: 'ŞİFRE', forbidden_words: ['PAROLA', 'GİRİŞ', 'GÜVENLİK', 'KARAKTER', 'GİZLİ'], category: 'Teknoloji', difficulty: 'Kolay', language: 'tr' },

  // Sinema & Dizi
  { id: 'c20', main_word: 'HABABAM SINIFI', forbidden_words: ['İNEK ŞABAN', 'MAHMUT HOCA', 'OKUL', 'KEMAL SUNAL', 'GÜDÜK NECMİ'], category: 'Sinema & Dizi', difficulty: 'Kolay', language: 'tr' },
  { id: 'c21', main_word: 'KURTLAR VADİSİ', forbidden_words: ['POLAT ALEMDAR', 'MEMATİ', 'DİZİ', 'RACON', 'SİLAH'], category: 'Sinema & Dizi', difficulty: 'Kolay', language: 'tr' },
  { id: 'c22', main_word: 'AVRUPA YAKASI', forbidden_words: ['BURHAN ALTINTOP', 'GÜLSE BİRSEL', 'NİŞANTAŞI', 'KOMEDİ', 'ASLI'], category: 'Sinema & Dizi', difficulty: 'Kolay', language: 'tr' },
  { id: 'c23', main_word: 'AŞK-I MEMNU', forbidden_words: ['BİHTER', 'BEHLÜL', 'ADNAN', 'FİRDEVS', 'YALI'], category: 'Sinema & Dizi', difficulty: 'Kolay', language: 'tr' },
  { id: 'c24', main_word: 'YÜZÜKLERİN EFENDİSİ', forbidden_words: ['FRODO', 'GANDALF', 'YÜZÜK', 'GOLUM', 'MORDOR'], category: 'Sinema & Dizi', difficulty: 'Kolay', language: 'tr' },
  { id: 'c25', main_word: 'HARRY POTTER', forbidden_words: ['BÜYÜCÜ', 'ASA', 'HOGWARTS', 'VOLDEMORT', 'SÜPÜRGE'], category: 'Sinema & Dizi', difficulty: 'Kolay', language: 'tr' },
  { id: 'c26', main_word: 'OSCAR', forbidden_words: ['ÖDÜL', 'HEYKEL', 'TÖREN', 'AKADEMİ', 'FİLM'], category: 'Sinema & Dizi', difficulty: 'Kolay', language: 'tr' },
  { id: 'c27', main_word: 'PATLAMIŞ MISIR', forbidden_words: ['SİNEMA', 'TUZ', 'MISIR', 'KOLTUĞU', 'FİLM'], category: 'Sinema & Dizi', difficulty: 'Kolay', language: 'tr' },

  // Spor
  { id: 'c28', main_word: 'OFSET', forbidden_words: ['FUTBOL', 'HAKEM', 'ÇİZGİ', 'BAYRAK', 'POZİSYON'], category: 'Spor', difficulty: 'Kolay', language: 'tr' },
  { id: 'c29', main_word: 'PENALTI', forbidden_words: ['BEYAZ NOKTA', 'KALECİ', 'FAUL', 'FUTBOL', 'VURUŞ'], category: 'Spor', difficulty: 'Kolay', language: 'tr' },
  { id: 'c30', main_word: 'BASKETBOL', forbidden_words: ['POTA', 'TOHUM', 'SMAÇ', 'ÜÇLÜK', 'NBA'], category: 'Spor', difficulty: 'Kolay', language: 'tr' },
  { id: 'c31', main_word: 'VOLEYBOL', forbidden_words: ['FİLE', 'MANŞET', 'SERVİS', 'SMAÇ', 'PASÖR'], category: 'Spor', difficulty: 'Kolay', language: 'tr' },
  { id: 'c32', main_word: 'FORMULA 1', forbidden_words: ['YARIŞ', 'PİLOT', 'ARABA', 'PİT STOP', 'PİST'], category: 'Spor', difficulty: 'Kolay', language: 'tr' },
  { id: 'c33', main_word: 'OLİMPİYAT', forbidden_words: ['MADALYA', 'MEŞALE', 'HALKA', 'DÜNYA', 'ŞAMPİYON'], category: 'Spor', difficulty: 'Kolay', language: 'tr' },
  { id: 'c34', main_word: 'SARI KART', forbidden_words: ['HAKEM', 'FAUL', 'UYARI', 'KIRMIZI', 'CEZA'], category: 'Spor', difficulty: 'Kolay', language: 'tr' },

  // Yemek & Mutfak
  { id: 'c35', main_word: 'LAHMACUN', forbidden_words: ['KIYMA', 'LİMON', 'FIRIN', 'MAYDANOZ', 'ÇITIR'], category: 'Yemek & Mutfak', difficulty: 'Kolay', language: 'tr' },
  { id: 'c36', main_word: 'BAKLAVA', forbidden_words: ['ŞERBET', 'FISTIK', 'CEVİZ', 'YUFKA', 'ANTEP'], category: 'Yemek & Mutfak', difficulty: 'Kolay', language: 'tr' },
  { id: 'c37', main_word: 'MENEMEN', forbidden_words: ['YUMURTA', 'DOMATES', 'BİBER', 'SOĞAN', 'KAHVALTI'], category: 'Yemek & Mutfak', difficulty: 'Kolay', language: 'tr' },
  { id: 'c38', main_word: 'MANTI', forbidden_words: ['YOĞURT', 'SARIMSAK', 'KAYSERİ', 'HAMUR', 'SOS'], category: 'Yemek & Mutfak', difficulty: 'Kolay', language: 'tr' },
  { id: 'c39', main_word: 'TÜRK KAHVESİ', forbidden_words: ['FİNCAN', 'FAL', 'KÖPÜK', 'LOKUM', 'ORTA'], category: 'Yemek & Mutfak', difficulty: 'Kolay', language: 'tr' },
  { id: 'c40', main_word: 'ÇAYDANLIK', forbidden_words: ['DEM', 'SICAK', 'BARDAK', 'KAHVALTI', 'SU'], category: 'Yemek & Mutfak', difficulty: 'Kolay', language: 'tr' },
  { id: 'c41', main_word: 'DÖNER', forbidden_words: ['ET', 'TAVUK', 'DÜRÜM', 'PİLAV', 'DÖNMEK'], category: 'Yemek & Mutfak', difficulty: 'Kolay', language: 'tr' },
  { id: 'c42', main_word: 'KÜNEFE', forbidden_words: ['PEYNİR', 'KADAYIF', 'ŞERBET', 'HATAY', 'SICAK'], category: 'Yemek & Mutfak', difficulty: 'Kolay', language: 'tr' },

  // 90lar & 2000ler
  { id: 'c43', main_word: 'ATARİ', forbidden_words: ['KASET', 'MARIO', 'OYUN', 'KOLLAR', 'TELEVİZYON'], category: '90lar & 2000ler', difficulty: 'Kolay', language: 'tr' },
  { id: 'c44', main_word: 'TETRİS', forbidden_words: ['BLOK', 'KUTU', 'DÜŞMEK', 'OYUN', 'ÇİZGİ'], category: '90lar & 2000ler', difficulty: 'Kolay', language: 'tr' },
  { id: 'c45', main_word: 'WALKMAN', forbidden_words: ['KASET', 'KULAKLIK', 'PİL', 'MÜZİK', 'SARMAMAK'], category: '90lar & 2000ler', difficulty: 'Kolay', language: 'tr' },
  { id: 'c46', main_word: 'TASO', forbidden_words: ['CİPS', 'POKEMON', 'ÇİZGİ', 'VURMAK', 'OYUN'], category: '90lar & 2000ler', difficulty: 'Kolay', language: 'tr' },
  { id: 'c47', main_word: 'MSN MESSENGER', forbidden_words: ['TİTREŞİM', 'DURUM', 'GÖZ KIRPMA', 'ÇEVRİMİÇİ', 'SOHBET'], category: '90lar & 2000ler', difficulty: 'Kolay', language: 'tr' },
];
