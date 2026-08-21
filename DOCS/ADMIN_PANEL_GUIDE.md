# 🛡️ DVT TABU GAME — ADMİN KONTROL PANELİ KULLANIM REHBERİ (ADMIN PANEL GUIDE)

Admin kontrol paneli, platformun tüm dinamiklerini, içeriklerini, kullanıcı odalarını, reklamlarını ve hata loglarını yönetmek için geliştirilmiş merkezi yönetim üssüdür.

* **Erişim Adresi:** `http://localhost:3000/admin`
* **Güvenlik:** 4 Haneli Güvenlik PIN'i (Varsayılan: `1234`, panel içinden değiştirilebilir).

---

## 🗂️ 1. Panel Sekmeleri ve İşlevleri

### 1. 🎴 Kart & Deste Havuzu (CMS)
* **Tekil Kart Ekleme:** Ana kelime, 5 yasaklı kelime, kategori, deste ve zorluk seçimi.
* **Toplu Kart İçe Aktarma (Bulk Import):** `KELİME: YASAK1, YASAK2, YASAK3, YASAK4, YASAK5` formatında onlarca kartı tek seferde yükleme.
* **🤖 Google Gemini AI Kart Üretici:** Verilen konu başlığına (örn: "Yapay Zeka ve Teknoloji") göre tek tıkla 5-10 adet sıfır hata içeren Tabu kartı ürettirme.
* **Deste Yönetimi:** Yeni kelime destesi oluşturma, renk atama ve yayına alma.

### 2. 🌐 Çok Oyunculu Odalar & Canlı Lobi Yönetimi
* Sistemde o an açık olan, bekleyen veya oynanmakta olan tüm odaların canlı listesi.
* **Admin Eylemleri:**
  * **[🚨 Odayı Kapat (Admin Sonlandır)]:** Odayı anında kapatır; oyundaki tüm oyuncuların ekranına **"⚠️ Oyun Odası Kapatıldı"** uyarısı gönderir ve ana sayfaya atar.
  * **[🗑️ Odayı Sil]:** Odayı veritabanından kalıcı olarak siler.
  * **[🔗 Odayı İncele]:** Admin olarak odaya yeni sekmede bağlanma.

### 3. 🎮 Oyun Denetimi & Kelime Zorluk Raporları
* **Oynanan Maçlar Akışı:** Oynanan tüm maçların skorları, kazanan takımlar, tamamlanma durumları ve Gemini AI spor spikeri maç yorumları.
* **En Çok Bilinen Kelimeler:** Doğru bilinme oranı en yüksek kartlar.
* **En Çok Tabu Yapılan Kelimeler:** Oyuncuların en sık yandığı kelimeler.
* **En Çok Pas Geçilen (Zor) Kelimeler:** İçerik optimizasyonu için zorluk tespiti.

### 4. 🐛 Hata & Log Merkezi
* Kullanıcı cihazlarından ve API'lerden gelen tüm hata/uyarı loglarının canlı izlenmesi.
* Log seviyeleri (`error`, `warn`, `info`) ve kaynak filtreleri (`gameplay`, `network`, `audio`, `render`).
* Tek tıkla "Çözüldü Olarak İşaretle" ve log geçmişini temizleme.

### 5. 👑 Monetizasyon & Paywall
* VIP Pro abonelik paketlerinin fiyat, avantaj ve süre ayarları.
* Paywall arayüzünün önizlemesi ve canlı test modalı.

### 6. 📢 Reklam & Ad Engine
* Reklam frekansı ve varsayılan format ayarları (Tam Ekran, Popup, Alt Banner).
* Reklam envanteri ekleme/düzenleme (başlık, görsel, link, geçilme süresi).
* **Sayfa Bazında Tıklama & Gösterim Tablosu:** `/play`, `/summary`, `/rooms` sayfalarındaki CTR oranları.
* **Canlı Reklam Etkinlik Günlüğü:** Kullanıcıların reklamı hangi saniyede geçtiği ve tıkladığının canlı akışı.

### 7. 📈 Analitik & Drop-off
* Günlük aktif kullanıcılar (DAU), ortalama oturum süresi, tur terk oranları ve dönüşüm hunisi.

### 8. 🚀 Sürüm & Dağıtım (Version Management)
* Canlıdaki aktif sürüm (örn: `1.1.0`), minimum zorunlu sürüm ve güncelleme notları yayını.

### 9. 🧭 Onboarding Akışı Stüdyosu
* Yeni kullanıcılara gösterilen 4 adımlı karşılama kartlarının metinlerini, ikonlarını ve sıralamasını canlı düzenleme.
