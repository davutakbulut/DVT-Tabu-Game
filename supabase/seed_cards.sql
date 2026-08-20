-- ==============================================================================
-- 🃏 DVT TABU GAME - 100+ TÜRKÇE TABU KARTI SEED VERİSİ
-- ==============================================================================

insert into cards (main_word, forbidden_words, category, difficulty, language) values
-- GENEL KÜLTÜR
('PİRAMİT', ARRAY['MISIR', 'FİRAVUN', 'ÜÇGEN', 'KEOPS', 'TARİH'], 'Genel Kültür', 'Kolay', 'tr'),
('EYFEL KULESİ', ARRAY['PARİS', 'FRANSA', 'DEMİR', 'TURİST', 'ŞEHİR'], 'Genel Kültür', 'Kolay', 'tr'),
('ANITKABİR', ARRAY['ATATÜRK', 'ANKARA', 'MEZAR', 'ASLANLI YOL', 'MOZOLE'], 'Genel Kültür', 'Kolay', 'tr'),
('GÖBEKLİTEPE', ARRAY['ŞANLIURFA', 'TARİH', 'TAPINAK', 'KAZI', 'ARKEOLOJİ'], 'Genel Kültür', 'Orta', 'tr'),
('KAPADOKYA', ARRAY['BALON', 'PERİ BACASI', 'NEVŞEHİR', 'KAYA', 'TURİZM'], 'Genel Kültür', 'Kolay', 'tr'),
('BOĞAZİÇİ', ARRAY['İSTANBUL', 'KÖPRÜ', 'DENİZ', 'MARMARA', 'YALI'], 'Genel Kültür', 'Kolay', 'tr'),
('PUSULA', ARRAY['YÖN', 'KUZEY', 'GÜNEY', 'MANYETİK', 'HARİTA'], 'Genel Kültür', 'Kolay', 'tr'),
('TELESKOP', ARRAY['UZAY', 'YILDIZ', 'GEZEGEN', 'GÖKYÜZÜ', 'MERCEK'], 'Genel Kültür', 'Kolay', 'tr'),
('KÜTÜPHANE', ARRAY['KİTAP', 'OKUMAK', 'SESSİZ', 'RAF', 'ÖDÜNÇ'], 'Genel Kültür', 'Kolay', 'tr'),
('NOTER', ARRAY['İMZA', 'ONAY', 'VEKALET', 'RESMİ', 'TASDİK'], 'Genel Kültür', 'Orta', 'tr'),
('DEPREM', ARRAY['FAY', 'SARSINTI', 'KANDİLLİ', 'ŞİDDET', 'RİCHTER'], 'Genel Kültür', 'Kolay', 'tr'),
('GÖKKUŞAĞI', ARRAY['YAĞMUR', 'GÜNEŞ', 'RENK', 'YEDİ', 'GÖKYÜZÜ'], 'Genel Kültür', 'Kolay', 'tr'),

-- TEKNOLOJİ
('YAPAY ZEKA', ARRAY['ROBOT', 'ALGORİTMA', 'BİLGİSAYAR', 'GELECEK', 'CHATGPT'], 'Teknoloji', 'Kolay', 'tr'),
('AKILLI TELEFON', ARRAY['EKRAN', 'DOKUNMATİK', 'ŞARJ', 'UYGULAMA', 'APPLE'], 'Teknoloji', 'Kolay', 'tr'),
('KABLOSUZ KULAKLIK', ARRAY['BLUETOOTH', 'MÜZİK', 'SES', 'KULAK', 'KUTU'], 'Teknoloji', 'Kolay', 'tr'),
('BULUT DEPOLAMA', ARRAY['İNTERNET', 'DRIVE', 'DOSYA', 'YEDEK', 'SUNUCU'], 'Teknoloji', 'Orta', 'tr'),
('BLOKZİNCİR', ARRAY['BİTCOİN', 'KRİPTO', 'ZİNCİR', 'GÜVENLİK', 'MADENCİLİK'], 'Teknoloji', 'Zor', 'tr'),
('DİZÜSTÜ BİLGİSAYAR', ARRAY['LAPTOP', 'KLAVYE', 'BATARYA', 'EKRAN', 'ÇANTA'], 'Teknoloji', 'Kolay', 'tr'),
('ALGORİTMA', ARRAY['KOD', 'YAZILIM', 'MANTIK', 'ADIM', 'PROGRAM'], 'Teknoloji', 'Orta', 'tr'),
('VİRAL', ARRAY['VİDEO', 'İNTERNET', 'TREND', 'PAYLAŞIM', 'SOSYAL MEDYA'], 'Teknoloji', 'Orta', 'tr'),
('ALTYAPI', ARRAY['FİBER', 'KABLO', 'HIZ', 'ŞEBEKE', 'İNTERNET'], 'Teknoloji', 'Zor', 'tr'),
('ŞİFRE', ARRAY['PAROLA', 'GİRİŞ', 'GÜVENLİK', 'KARAKTER', 'GİZLİ'], 'Teknoloji', 'Kolay', 'tr'),

-- SİNEMA & DİZİ
('HABABAM SINIFI', ARRAY['İNEK ŞABAN', 'MAHMUT HOCA', 'OKUL', 'KEMAL SUNAL', 'GÜDÜK NECMİ'], 'Sinema & Dizi', 'Kolay', 'tr'),
('KURTLAR VADİSİ', ARRAY['POLAT ALEMDAR', 'MEMATİ', 'DİZİ', 'RACON', 'SİLAH'], 'Sinema & Dizi', 'Kolay', 'tr'),
('AVRUPA YAKASI', ARRAY['BURHAN ALTINTOP', 'GÜLSE BİRSEL', 'NİŞANTAŞI', 'KOMEDİ', 'ASLI'], 'Sinema & Dizi', 'Kolay', 'tr'),
('AŞK-I MEMNU', ARRAY['BİHTER', 'BEHLÜL', 'ADNAN', 'FİRDEVS', 'YALI'], 'Sinema & Dizi', 'Kolay', 'tr'),
('YÜZÜKLERİN EFENDİSİ', ARRAY['FRODO', 'GANDALF', 'YÜZÜK', 'GOLUM', 'MORDOR'], 'Sinema & Dizi', 'Kolay', 'tr'),
('HARRY POTTER', ARRAY['BÜYÜCÜ', 'ASA', 'HOGWARTS', 'VOLDEMORT', 'SÜPÜRGE'], 'Sinema & Dizi', 'Kolay', 'tr'),
('OSCAR', ARRAY['ÖDÜL', 'HEYKEL', 'TÖREN', 'AKADEMİ', 'FİLM'], 'Sinema & Dizi', 'Kolay', 'tr'),
('PATLAMIŞ MISIR', ARRAY['SİNEMA', 'TUZ', 'MISIR', 'KOLTUĞU', 'FİLM'], 'Sinema & Dizi', 'Kolay', 'tr'),
('DUBLE KASKET', ARRAY['FİLM', 'DUBLÖR', 'ROL', 'YÖNETMEN', 'SENARYO'], 'Sinema & Dizi', 'Zor', 'tr'),
('GİŞE', ARRAY['BİLET', 'HASILAT', 'SİNEMA', 'REKOR', 'SEYİRCİ'], 'Sinema & Dizi', 'Orta', 'tr'),

-- SPOR
('OFSET', ARRAY['FUTBOL', 'HAKEM', 'ÇİZGİ', 'BAYRAK', 'POZİSYON'], 'Spor', 'Kolay', 'tr'),
('PENALTI', ARRAY['BEYAZ NOKTA', 'KALECİ', 'FAUL', 'FUTBOL', 'VURUŞ'], 'Spor', 'Kolay', 'tr'),
('BASKETBOL', ARRAY['POTA', 'TOHUM', 'SMAÇ', 'ÜÇLÜK', 'NBA'], 'Spor', 'Kolay', 'tr'),
('VOLEYBOL', ARRAY['FİLE', 'MANŞET', 'SERVİS', 'SMAÇ', 'PASÖR'], 'Spor', 'Kolay', 'tr'),
('FORMULA 1', ARRAY['YARIŞ', 'PİLOT', 'ARABA', 'PİT STOP', 'PİST'], 'Spor', 'Kolay', 'tr'),
('OLİMPİYAT', ARRAY['MADALYA', 'MEŞALE', 'HALKA', 'DÜNYA', 'ŞAMPİYON'], 'Spor', 'Kolay', 'tr'),
('MARATON', ARRAY['KOŞU', 'KİLOMETRE', 'YARIŞ', 'ADIM', 'NEFES'], 'Spor', 'Orta', 'tr'),
('UZATMA', ARRAY['DAKİKA', 'BERABERE', 'FUTBOL', 'MAÇ', 'HAKEM'], 'Spor', 'Orta', 'tr'),
('SARI KART', ARRAY['HAKEM', 'FAUL', 'UYARI', 'KIRMIZI', 'CEZA'], 'Spor', 'Kolay', 'tr'),
('AMATÖR', ARRAY['PROFESYONEL', 'LİG', 'SPORCU', 'KULÜP', 'GÖNÜLLÜ'], 'Spor', 'Orta', 'tr'),

-- YEMEK & MUTFAK
('LAHMACUN', ARRAY['KIYMA', 'LİMON', 'FIRIN', 'MAYDANOZ', 'ÇITIR'], 'Yemek & Mutfak', 'Kolay', 'tr'),
('BAKLAVA', ARRAY['ŞERBET', 'FISTIK', 'CEVİZ', 'YUFKA', 'ANTEP'], 'Yemek & Mutfak', 'Kolay', 'tr'),
('MENEMEN', ARRAY['YUMURTA', 'DOMATES', 'BİBER', 'SOĞAN', 'KAHVALTI'], 'Yemek & Mutfak', 'Kolay', 'tr'),
('MANTI', ARRAY['YOĞURT', 'SARIMSAK', 'KAYSERİ', 'HAMUR', 'SOS'], 'Yemek & Mutfak', 'Kolay', 'tr'),
('TÜRK KAHVESİ', ARRAY['FİNCAN', 'FAL', 'KÖPÜK', 'LOKUM', 'ORTA'], 'Yemek & Mutfak', 'Kolay', 'tr'),
('ÇAYDANLIK', ARRAY['DEM', 'SICAK', 'BARDAK', 'KAHVALTI', 'SU'], 'Yemek & Mutfak', 'Kolay', 'tr'),
('KÖFTE', ARRAY['KIYMA', 'IZGARA', 'EKMEK', 'PİYAZ', 'İNEGÖL'], 'Yemek & Mutfak', 'Kolay', 'tr'),
('DÖNER', ARRAY['ET', 'TAVUK', 'DÜRÜM', 'PİLAV', 'DÖNMEK'], 'Yemek & Mutfak', 'Kolay', 'tr'),
('KÜNEFE', ARRAY['PEYNİR', 'KADAYIF', 'ŞERBET', 'HATAY', 'SICAK'], 'Yemek & Mutfak', 'Kolay', 'tr'),
('GÜVEÇ', ARRAY['TOPRAK', 'FIRIN', 'ET', 'YEMEK', 'ÇÖMLEK'], 'Yemek & Mutfak', 'Orta', 'tr'),

-- 90LAR & NOSTALJİ
('ATARİ', ARRAY['KASET', 'MARIO', 'OYUN', 'KOLLAR', 'TELEVİZYON'], '90lar & 2000ler', 'Kolay', 'tr'),
('TETRİS', ARRAY['BLOK', 'KUTU', 'DÜŞMEK', 'OYUN', 'ÇİZGİ'], '90lar & 2000ler', 'Kolay', 'tr'),
('WALKMAN', ARRAY['KASET', 'KULAKLIK', 'PİL', 'MÜZİK', 'SARMAMAK'], '90lar & 2000ler', 'Kolay', 'tr'),
('TASO', ARRAY['CİPS', 'POKEMON', 'ÇİZGİ', 'VURMAK', 'OYUN'], '90lar & 2000ler', 'Kolay', 'tr'),
('MSN MESSENGER', ARRAY['TİTREŞİM', 'DURUM', 'GÖZ KIRPMA', 'ÇEVRİMİÇİ', 'SOHBET'], '90lar & 2000ler', 'Kolay', 'tr');
