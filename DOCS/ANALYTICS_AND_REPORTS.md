# 📊 DVT TABU GAME — ANALİTİK, RAPORLAR & TELEMETRİ MANTIĞI (ANALYTICS & REPORTS)

Bu döküman; oyun içi telemetrinin nasıl toplandığını, kelime zorluk skorlarının nasıl hesaplandığını ve analitik raporların oluşturulma prensiplerini açıklar.

---

## 🎯 1. Kelime Zorluk & Başarı Hesaplama Mantığı

Her kelime kartı (`cards`) oynandığında sistem anlık sayaçları artırır:
* `times_played`: Kartın toplam oynanma sayısı.
* `times_correct`: Doğru bilinme sayısı.
* `times_tabu`: Tabu yapılma sayısı.
* `times_passed`: Pas geçilme sayısı.

### 📐 Hesaplanan Metrikler:
1. **Başarı Oranı (%):**
   $$\text{Doğru Oranı} = \left( \frac{\text{times\_correct}}{\text{times\_played}} \right) \times 100$$
2. **Tabu Eğilimi (%):**
   $$\text{Tabu Oranı} = \left( \frac{\text{times\_tabu}}{\text{times\_played}} \right) \times 100$$
3. **Zorluk / Pas Oranı (%):**
   $$\text{Pas Oranı} = \left( \frac{\text{times\_passed}}{\text{times\_played}} \right) \times 100$$

Bu oranlar sayesinde editörler ve adminler hangi kelimelerin çok kolay, hangilerinin aşırı zor olduğunu tespit ederek deste dengesini (balancing) optimize edebilir.

---

## 🎮 2. Maç Geçmişi & Oturum İzleme (`game_sessions`)

Her maç başlatıldığında benzersiz bir `session_id` oluşturulur:
* **Tur Bazında Skorlar:** Takımların her turda topladığı puanlar ve toplam süreler.
* **Terk Oranı (Drop-off):** `status === 'in_progress'` olarak kalıp 15 dakikadan uzun süre işlem görmeyen oturumlar "Yarıda Bırakıldı (Abandoned)" olarak raporlanır.
* **AI Spiker Entegrasyonu:** Maç bittiğinde Gemini AI modeline skorlar ve en çok tabu yapılan kelimeler gönderilerek esprili bir spor spikeri özeti üretilir ve oturum kaydına (`ai_summary`) eklenir.

---

## 📈 3. Kullanıcı Davranışı & Huni (Funnel) Analitiği

Kullanıcıların platformdaki adımları `lib/analytics.ts` üzerinden izlenir:
1. `page_view` (Sayfa görüntüleme)
2. `game_started` (Oyun başlatma)
3. `round_completed` (Tur tamamlama)
4. `game_completed` (Maç bitirme)
5. `ad_impression` & `ad_click` (Reklam etkileşimi)
6. `paywall_view` & `pro_upgrade` (VIP satın alma dönüşümü)

Bu metrikler sayesinde kullanıcıların en çok nerede takıldığı veya hangi aşamada oyunu bıraktığı Admin Analitik panelinde grafiklerle görselleştirilir.
