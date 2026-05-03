# 🧠 StokTakip Pro — Proje Beyin Dosyası

> **Bu dosyayı her yeni sohbetin başında oku. Projenin tüm mantığını, yapısını ve kurallarını içerir.**
> Son güncelleme: 2026-04-20

---

## 1. Proje Özeti

**StokTakip Pro**, elektronik mağaza (cep telefonu/aksesuar dükkanı) için geliştirilmiş kapsamlı bir **stok, satış, tamir ve müşteri yönetim sistemidir**. Hedef kullanıcı: "technocep" markası altında çalışan mağaza yöneticisi.

- **Dil**: Türkçe arayüz (tüm label, buton ve mesajlar Türkçe)
- **Para birimi**: TRY (₺) ana birim, USD ($) dönüşüm destekli
- **Tema**: Dark mode varsayılan, 10 farklı renk tema seçeneği mevcut

---

## 2. Teknoloji Yığını

| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| **Framework** | React + TypeScript | React 19.2, TS 5.9 |
| **Build Tool** | Vite | 7.3 |
| **Styling** | Tailwind CSS (CDN) + Custom CSS Variables | CDN (runtime) |
| **Backend** | Supabase (PostgreSQL + Edge Functions) | — |
| **Grafikler** | Recharts, @visx/* | 3.7, 3.12 |
| **PDF** | jsPDF | 4.2 |
| **Barkod** | JsBarcode | 3.12 |
| **QR Okuyucu** | html5-qrcode | 2.3 |
| **Excel** | xlsx (SheetJS) | 0.18.5 |
| **Animasyon** | motion (Framer Motion) | 12.35 |
| **Font** | Inter (Google Fonts) |  |
| **İkonlar** | Material Symbols Outlined (Google) |  |

### Önemli Notlar
- Tailwind **CDN üzerinden** yükleniyor (`index.html` içinde `<script src="https://cdn.tailwindcss.com">`), npm paketi olarak DEĞİL
- Tailwind config `index.html` içindeki `<script>` bloğunda tanımlı (CSS değişkenleri ile)
- CSS değişkenleri `:root` ve `.dark` selectorleri içinde tanımlı
- Light mode `html.light` class'ı ekleyerek `filter: invert(1)` ile yapılıyor (hack yöntemi)

---

## 3. Proje Dosya Yapısı

```
stoktakip2-main/
├── index.html              # Ana HTML — Tailwind config, CSS değişkenleri, tema, animasyonlar
├── vite.config.ts           # Vite config (sadece react plugin)
├── package.json             # Bağımlılıklar
├── push.bat                 # Git push scripti (eski yol referansı)
├── public/
│   └── vite.svg             # Varsayılan favicon
│
└── src/
    ├── main.tsx             # Giriş noktası (StrictMode + App)
    ├── App.tsx              # Ana uygulama bileşeni — Routing, state yönetimi, layout
    │
    ├── types/
    │   └── index.ts         # TÜM TypeScript interface/type tanımları (~391 satır)
    │
    ├── contexts/
    │   └── ThemeContext.tsx  # 10 renk teması yönetimi (CSS değişkenlerini değiştirir)
    │
    ├── utils/
    │   ├── api.ts           # Supabase API katmanı (~781 satır) — TÜM CRUD işlemleri
    │   ├── helpers.ts       # Format fonksiyonları, durum etiketleri, segment config
    │   ├── pos.ts           # Fiş yazdırma (Browser print + ESC/POS Web Serial)
    │   ├── uploadToSupabase.ts  # Fotoğraf upload/delete (Supabase Storage)
    │   ├── tacDatabase.ts   # IMEI → Marka/Model eşleme (522+ TAC kaydı)
    │   └── *.cjs            # Debug/check scriptleri (production dışı)
    │
    ├── components/
    │   ├── Sidebar.tsx           # Sol menü navigasyonu (18 menü öğesi)
    │   ├── LoginPage.tsx         # Giriş ekranı (hardcoded credentials)
    │   ├── Toast.tsx             # Bildirim sistemi (Context API)
    │   ├── GlobalSearch.tsx      # Ctrl+K ile global arama (ürün/müşteri/tamir/tedarikçi)
    │   ├── PriceVisibility.tsx   # Fiyat gizleme + para birimi dönüşümü (Context API)
    │   ├── AIForecastWidget.tsx  # Gemini AI satış tahmin widget'ı
    │   ├── BackupManager.tsx     # Veri yedekleme/geri yükleme arayüzü
    │   ├── BarcodePrintModal.tsx # Barkod etiket yazdırma modal'ı
    │   ├── BulkProductImportModal.tsx # Excel'den toplu ürün import
    │   ├── CustomerSelector.tsx  # Müşteri seçme/oluşturma dropdown
    │   ├── IMEIChecker.tsx       # IMEI sorgulama ve cihaz tanıma
    │   ├── LoyaltyCard.tsx       # Müşteri sadakat kartı bileşeni
    │   ├── POSPrintButton.tsx    # POS yazıcı bağlantı/yazdırma butonu
    │   ├── PWAInstallPrompt.tsx  # PWA kurulum istemi
    │   ├── RepairPhotoGallery.tsx # Tamir öncesi/sonrası fotoğraf galerisi
    │   ├── RepairScheduler.tsx   # Tamir randevu planlayıcı
    │   ├── SegmentBadge.tsx      # Müşteri segment rozeti
    │   ├── WarrantyTracker.tsx   # Garanti takip bileşeni
    │   └── ui/
    │       └── area-chart.tsx    # Özel area chart bileşeni (visx tabanlı, ~68KB)
    │
    └── pages/
        ├── SalesPage.tsx         # Satış & Raporlar (ana sayfa)
        ├── ProductsPage.tsx      # Ürün yönetimi (CRUD, barkod, stok)
        ├── RepairsPage.tsx       # Tamir kayıtları (48KB — en büyük sayfa)
        ├── PhoneSalesPage.tsx    # Telefon satışları (stok + satış)
        ├── CustomersPage.tsx     # Müşteri yönetimi (52KB — en kapsamlı sayfa)
        ├── AnalyticsPage.tsx     # Grafikler ve analizler
        ├── ExpensesPage.tsx      # Gider yönetimi
        ├── PurchasesPage.tsx     # Alış (tedarikçiden) kayıtları
        ├── SuppliersPage.tsx     # Tedarikçi yönetimi + cari hesap
        ├── RequestsPage.tsx      # Müşteri istek/sipariş takibi
        ├── CalculatorPage.tsx    # Hesap makinesi (kâr/zarar hesaplama)
        ├── RemindersPage.tsx     # Hatırlatıcılar sistemi
        ├── RepairPartsPage.tsx   # Tamir parça stoğu yönetimi
        ├── AppointmentCalendar.tsx # Randevu takvimi
        └── SettingsPage.tsx      # Genel ayarlar (tema seçimi vb.)
```

---

## 4. Mimari ve Veri Akışı

### 4.1 State Yönetimi
- **Merkezi state**: `App.tsx` içinde `useState` hook'ları ile yönetilir
- **Context API**: 3 context kullanılır:
  1. `ToastProvider` — Bildirimler
  2. `ThemeProvider` — Renk teması
  3. `PriceVisibilityProvider` — Fiyat gizleme + para birimi
- **Router YOK** — Sayfa geçişleri `activeView` state'i ile yapılır (switch/case)
- Tüm data App.tsx'ten child component'lere **prop drilling** ile iletilir

### 4.2 Veri Yükleme
```
App.tsx: loadAllData()
  ├── Promise.allSettled([...]) ile 11 endpoint paralel çağrılır
  ├── Her biri ilgili setState'i günceller
  └── Hata olursa console.warn ile loglanır (sessiz hata)
```

### 4.3 Backend Mimarisi (İKİ KATMANLI)

**Dikkat: İki farklı API erişim yöntemi vardır!**

#### Katman 1: Edge Function (RESTful)
- URL: `https://xtjvbkhappiceyrlovkx.supabase.co/functions/v1/make-server-929c4905`
- Kullanım: `edgeFetch()` helper'ı ile
- Tablolar: `categories`, `products`, `sales`, `repairs`, `phone-sales`, `expenses`, `customer-requests`
- Format: JSON body'lerle RESTful (GET/POST/PUT/DELETE)
- **camelCase** format kullanılır (edge function dönüşüm yapar)

#### Katman 2: Supabase REST API (Doğrudan)
- URL: `https://xtjvbkhappiceyrlovkx.supabase.co/rest/v1/`
- Kullanım: `dbFetch()` helper'ı ile
- Tablolar: `phone_stocks`, `suppliers`, `purchases`, `purchase_items`, `cari_hareketler`, `payments`, `customers`, `reminders`, `warranty_records`, `technicians`, `repair_parts`, `repair_part_usage`, `repair_photos`, `repair_appointments`
- Format: PostgREST query syntax (`?id=eq.xxx`, `?select=*,supplier:suppliers(*)`)
- **snake_case** format kullanılır → `snakeToCamel()` / `camelToSnake()` ile dönüşüm

#### Katman 3: Supabase Storage
- Bucket'lar: `backups`, `repair-photos`, `customer-photos`
- İşlemler: Upload, delete, download (public URL döner)

### 4.4 Kimlik Doğrulama
- **Basit hardcoded login**: Kullanıcı adı `technocep`, şifre `technocep`
- `localStorage.isAuth = 'true'` ile oturum yönetimi
- Supabase Auth KULLANILMIYOR, sadece anon key ile erişim

---

## 5. Veritabanı Şeması (Tablo-Interface Eşlemesi)

### Edge Function Tabloları (camelCase)
| Tablo | Interface | Temel Alanlar |
|-------|-----------|---------------|
| categories | `Category` | id, name, icon?, color? |
| products | `Product` | id, name, categoryId, barcode, stock, minStock, purchasePrice, salePrice |
| sales | `Sale` | id, items[], totalPrice, totalProfit, date, paymentMethod, paymentDetails?, customerInfo? |
| repairs | `RepairRecord` | id, customerName, customerPhone, deviceInfo, imei, status, repairCost, partsCost, prePayment, supplierId? |
| phone_sales | `PhoneSale` | id, brand, model, imei, purchasePrice, salePrice, profit, date, paymentMethod |
| expenses | `Expense` | id, name, category, amount, status(odendi/bekliyor), isRecurring |
| customer_requests | `CustomerRequest` | id, customerName, productName, priority, status, estimatedBudget |

### Supabase Doğrudan Tabloları (snake_case → camelCase mapping)
| Tablo | Interface | Temel Alanlar |
|-------|-----------|---------------|
| phone_stocks | `PhoneStock` | id, brand, model, imei, status(in_stock/sold) |
| suppliers | `Supplier` | id, name, contactName, phone, whatsapp, totalPurchased, totalPaid, balance |
| purchases | `Purchase` | id, supplierId, invoiceNumber, status, total, paidAmount, remaining |
| purchase_items | `PurchaseItem` | id, purchaseId, productId, quantity, unitCost |
| cari_hareketler | `CariHareket` | id, supplierId, islemTipi(alis/odeme/iade/borc_ekleme/alacak_ekleme), miktar |
| payments | `Payment` | id, purchaseId, supplierId, amount, paymentMethod |
| customers | `Customer` | id, name, phone, email, debt, credit, loyaltyPoints?, segment?, idNumber? |
| reminders | `Reminder` | id, title, remindAt, repeatType, priority, category, isCompleted |
| warranty_records | `WarrantyRecord` | id, itemType, serialNumber?, warrantyEndDate |
| technicians | `Technician` | id, name, specialties?, isActive |
| repair_parts | `RepairPart` | id, partName, stockQuantity, minStock, unitCost, unitPrice |
| repair_part_usage | `RepairPartUsage` | id, repairId, partId, quantity |
| repair_photos | `RepairPhoto` | id, repair_id, url, photo_type(before/after), note |
| repair_appointments | `RepairAppointment` | id, customerName, appointmentDate, appointmentTime, status |

---

## 6. Sayfa Detayları ve İş Mantığı

### 6.1 Satış & Raporlar (SalesPage) — Varsayılan Sayfa
- Satış listesi, filtreleme (tarih aralığı, ödeme yöntemi)
- Yeni satış oluşturma (çoklu ürün, barkod okuma, stok düşme)
- Ödeme yöntemleri: Nakit, Kart, Havale, Vadeli, Karışık (split payment)
- Kâr/zarar raporları, günlük/haftalık/aylık özet
- Fiş yazdırma (POS veya browser print)

### 6.2 Ürünler (ProductsPage)
- Ürün CRUD, kategori yönetimi
- Barkod oluşturma/yazdırma (JsBarcode + jsPDF)
- Stok takibi, minimum stok uyarısı
- Excel'den toplu import (BulkProductImportModal)
- QR/Barkod kamera okuyucu

### 6.3 Tamir Kayıtları (RepairsPage) — En Kapsamlı
- Tamir kaydı CRUD (müşteri, cihaz, IMEI, sorun, maliyet)
- Durumlar: `in_progress` → `completed` → `delivered` (+ `waiting_parts`, `cancelled`)
- Ön ödeme takibi
- Tedarikçi bağlantısı (parça siparişi)
- Tamir öncesi/sonrası fotoğraf yükleme (RepairPhotoGallery)
- Parça kullanım takibi (RepairPartUsage)
- Teknisyen atama

### 6.4 Telefon Satışları (PhoneSalesPage)
- İkinci el telefon stok yönetimi (PhoneStock)
- Satış kaydı (IMEI bazlı)
- IMEI → Marka/Model otomatik tanıma (TAC veritabanı)
- Satıldığında stok durumu güncelleme

### 6.5 Müşteriler (CustomersPage) — En Büyük Sayfa (52KB)
- Müşteri CRUD
- Borç/alacak (cari) takibi
- Sadakat puanı sistemi (loyaltyPoints, loyaltyTier: bronze/silver/gold/platinum)
- Müşteri segmentasyonu (VIP, Düzenli, Standart, Yeni, Pasif)
- Fotoğraf yükleme (profil, kimlik ön/arka)
- TCKN kaydı
- Satış/tamir geçmişi görüntüleme

### 6.6 Analizler (AnalyticsPage)
- Gelir/gider grafikleri (Recharts)
- Kâr/zarar raporu
- ABC analizi (ürün karlılık sınıflandırması)
- Kategori bazlı satış dağılımı

### 6.7 Tedarikçiler (SuppliersPage)
- Tedarikçi CRUD
- Cari hesap (borç/alacak) takibi
- Cari hareketler (alış, ödeme, iade, borç/alacak ekleme)
- Ödeme kaydetme

### 6.8 Alışlar (PurchasesPage)
- Tedarikçiden alış kaydı
- Fatura numarası, döviz kuru desteği
- Ürün bazlı alış detayları (PurchaseItem)
- Stok otomatik güncelleme

### 6.9 Giderler (ExpensesPage)
- Gider CRUD (kira, elektrik, personel vb.)
- Tekrarlayan gider desteği
- Durum: Ödendi / Bekliyor
- Kategorilere göre analiz

### 6.10 Hatırlatıcılar (RemindersPage)
- Hatırlatma CRUD (tarih, saat, tekrar tipi)
- Öncelik: Düşük, Orta, Yüksek
- Kategoriler: Genel, Tamir, Sipariş, Borç, Diğer
- Tamamlanma durumu

### 6.11 Diğer Sayfalar
- **İstek & Siparişler**: Müşteri ürün istekleri (beklemede/bulundu/bildirildi/tamamlandı)
- **Hesap Makinesi**: Kâr/zarar hesaplayıcı
- **Randevu Takvimi**: Tamir randevuları (takvim görünümü)
- **Garanti Takibi**: Ürün/telefon/tamir garanti süresi takibi
- **AI Tahmin**: Gemini Flash API ile satış tahmini (VITE_GEMINI_API_KEY gerekir)
- **Veri Yedekleme**: Supabase Storage veya local dosya olarak backup/restore
- **Parça Stoğu**: Tamir parçası envanter yönetimi
- **Ayarlar**: Renk teması seçimi (10 tema)

---

## 7. Önemli Desenler ve Kurallar

### 7.1 API Çağrıları
```typescript
// Edge Function (categories, products, sales, repairs, phone-sales, expenses, customer-requests)
edgeFetch('/endpoint')          // GET
edgeFetch('/endpoint', { method: 'POST', body: JSON.stringify(data) })  // CREATE
edgeFetch('/endpoint/:id', { method: 'PUT', body: JSON.stringify(data) })  // UPDATE
edgeFetch('/endpoint/:id', { method: 'DELETE' })  // DELETE

// Supabase REST (diğer tüm tablolar)
dbFetch('/table_name?select=*&order=created_at.desc')  // GET
dbFetch('/table_name', { method: 'POST', body: JSON.stringify(snakePayload) })  // CREATE
dbFetch('/table_name?id=eq.xxx', { method: 'PATCH', body: JSON.stringify(snakePayload) })  // UPDATE
dbFetch('/table_name?id=eq.xxx', { method: 'DELETE' })  // DELETE
```

### 7.2 ID Kuralı
- Edge Function tabloları: String ID (genellikle 6+ karakter, `id.length > 5` kontrolü ile update/create ayrımı yapılır)
- Supabase tabloları: UUID formatında ID
- **Dikkat**: Edge Function ID'leri UUID değildir, `purchase_items.product_id` ile eşleşirken dikkat

### 7.3 Stil Kuralı
- Tailwind CSS sınıfları kullanılır (CDN)
- Tema renkleri CSS değişkenleri üzerinden: `--color-primary`, `--color-bg-dark`, `--color-surface-dark`, `--color-surface-hover`
- Özel classlar: `glass-panel`, `card-hover`, `btn-press`, `menu-item`, `animate-page-enter`, `animate-slide-in`, `animate-fade-in`
- İkonlar: `<span className="material-symbols-outlined">icon_name</span>`

### 7.4 Ödeme Yöntemleri (Tüm Satış/Tamir'de Ortak)
| Kod | Etiket |
|-----|--------|
| `cash` / `nakit` | Nakit |
| `card` / `kart` | Kart |
| `transfer` / `havale` | Havale |
| `mixed` | Karışık (Split) |
| `vadeli` | Vadeli |

### 7.5 Durum (Status) Kodları

**Tamir Durumları:**
| Kod | Etiket | Renk |
|-----|--------|------|
| `in_progress` | İşlemde | Mavi |
| `completed` | Tamamlandı | Yeşil |
| `delivered` | Teslim Edildi | Zümrüt |
| `waiting_parts` | Parça Bekliyor | Turuncu |
| `cancelled` | İptal | Kırmızı |

**Alış (Purchase) Durumları:**
| Kod | Etiket |
|-----|--------|
| `odenmedi` | Ödenmedi |
| `kismi_odendi` | Kısmi Ödendi |
| `odendi` | Ödendi |

**Gider Durumları:** `odendi` | `bekliyor`

**Müşteri Segmentleri:** `vip` 👑 | `frequent` ⭐ | `regular` 👤 | `new` 🎁 | `inactive` 😴

**Sadakat Kademeleri:** `bronze` | `silver` | `gold` | `platinum`

---

## 8. Context (Provider) Yapıları

### ToastProvider (Toast.tsx)
```typescript
const { showToast } = useToast();
showToast('Mesaj', 'success');  // 'success' | 'error' | 'warning'
```

### ThemeProvider (ThemeContext.tsx)
```typescript
const { currentTheme, setTheme } = useTheme();
setTheme('midnight-blue');  // Tema ID'leri aşağıda
```
**Tema ID'leri:** `midnight-blue` (varsayılan), `ocean-cyan`, `emerald-forest`, `violet-galaxy`, `golden-amber`, `crimson-fire`, `rose-neon`, `teal-mint`, `orange-energy`, `steel-gray`

### PriceVisibilityProvider (PriceVisibility.tsx)
```typescript
const { visible, toggle, currency, setCurrency, usdRate } = usePriceVisibility();
const formatPrice = useFormatPrice();
formatPrice(1500);  // "₺1.500,00" veya "$39.47"
```
- USD/TRY kuru: `open.er-api.com` veya fallback `38.5 TL`

---

## 9. Özel Özellikler

### 9.1 Global Arama (Ctrl+K)
- Ürün (isim, barkod), Müşteri (isim, telefon), Tamir (isim, IMEI, cihaz), Tedarikçi (isim, telefon)
- Klavye navigasyonu: ↑↓ gezin, Enter seç, ESC kapat
- Maksimum 8 sonuç gösterir

### 9.2 IMEI Kontrol (IMEIChecker)
- 15 haneli IMEI girişi
- Luhn algoritması ile geçerlilik kontrolü
- TAC veritabanı (522+ kayıt) ile marka/model eşleme
- Prefix bazlı cihaz serisi tahmini

### 9.3 Fiş Yazdırma (POS)
- **Browser Print**: Yeni pencere açarak standart print dialog
- **ESC/POS**: Web Serial API ile termal yazıcıya doğrudan gönderim (9600 baud)
- 72mm fiş genişliği

### 9.4 Veri Yedekleme (BackupManager)
- 12 tablo yedeklenir: products, categories, sales, repairs, phone_stocks, phone_sales, expenses, customer_requests, suppliers, purchases, customers, reminders
- Cloud (Supabase Storage `backups` bucket) veya local dosya
- JSON formatında backup/restore
- Upsert ile çakışma önleme

### 9.5 AI Satış Tahmini (AIForecastWidget)
- Gemini 1.5 Flash API kullanılır
- Son 50 satış verisi analiz edilir
- Çıktı: Haftalık/aylık tahmin, trend, öneriler, risk faktörleri
- API key yoksa veya hata varsa: Yerel basit ortalama hesaplaması (fallback)
- Env değişkeni: `VITE_GEMINI_API_KEY`

---

## 10. Bilinen Notlar ve Dikkat Edilecekler

1. **Sales deduplikasyon**: `getSales()` fonksiyonunda ID bazlı deduplikasyon var (edge function bazen duplicate dönüyor)
2. **Product ID format farkı**: Edge Function ID'leri UUID değil, `purchase_items.product_id` için UUID regex kontrolü var
3. **RLS bypass**: Bazı işlemler (cari hareket, supplier balance) Edge Function üzerinden yapılır çünkü doğrudan Supabase RLS engeli var
4. **Light mode**: CSS `filter: invert(1) hue-rotate(180deg)` hack'i ile — img/video için ters çevirme uygulanır
5. **Responsive**: Mobile hamburger menü + masaüstü sidebar layout, `md:` breakpoint'i ile ayrılır
6. **Login güvenliği**: Hardcoded credentials — production için güvenli DEĞİL
7. **Supabase key**: Anon key kod içinde açık — bu beklenen davranış (RLS ile korunuyor)
8. **snakeToCamel dönüşümü**: Supabase doğrudan tablolarında her zaman manuel dönüşüm gerekir

---

## 11. Menü Yapısı (Sidebar Sıralaması)

| # | ID | Etiket | İkon |
|---|-----|--------|------|
| 1 | sales | Satış & Raporlar | dashboard |
| 2 | products | Ürünler | inventory_2 |
| 3 | repairs | Tamir Kayıtları | build |
| 4 | repairParts | Parça Stoğu | construction |
| 5 | phoneSales | Telefon Satışları | smartphone |
| 6 | customers | Müşteriler | group |
| 7 | analytics | Analizler | bar_chart |
| 8 | requests | İstek & Siparişler | list_alt |
| 9 | calculator | Hesap Makinası | calculate |
| 10 | purchases | Alışlar | shopping_bag |
| 11 | expenses | Giderler | trending_down |
| 12 | suppliers | Tedarikçiler | store |
| 13 | reminders | Hatırlatıcılar | notifications_active |
| 14 | appointments | Randevu Takvimi | calendar_month |
| 15 | warranty | Garanti Takibi | verified_user |
| 16 | aiForecast | AI Tahmin | auto_awesome |
| 17 | backup | Veri Yedekleme | cloud_sync |
| 18 | settings | Ayarlar | settings |

---

## 12. Geliştirme Rehberi

### Yeni Sayfa Ekleme
1. `src/pages/YeniSayfa.tsx` oluştur
2. `App.tsx`'te import et ve `renderView()` switch'ine ekle
3. `viewLabels` objesine Türkçe etiket ekle
4. `Sidebar.tsx`'teki `menuItems` dizisine ekle
5. Eğer veri gerekiyorsa, `types/index.ts`'te interface tanımla
6. `utils/api.ts`'te CRUD fonksiyonları yaz

### Yeni Tablo Ekleme (Supabase)
1. `types/index.ts`'te interface tanımla
2. `utils/api.ts`'te get/save/delete fonksiyonları yaz
3. snake_case ↔ camelCase dönüşümü için `snakeToCamel()` / `camelToSnake()` kullan
4. Edge Function'da mı yoksa doğrudan Supabase REST'te mi olacağına karar ver

### Stil Kuralları
- Arka plan: `bg-background-dark`, `bg-surface-dark`, `bg-surface-hover`
- Metin: `text-white` (başlık), `text-slate-300` (normal), `text-slate-400` (soluk), `text-slate-500` (çok soluk)
- Kenarlık: `border-slate-800`, `border-slate-700`
- Vurgu: `bg-primary/10 text-primary`, `bg-primary/20`
- Buton: `bg-primary hover:bg-primary-hover text-white rounded-lg`
- Input: `bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary`
- Kart: `glass-panel rounded-2xl p-6` veya `bg-surface-dark rounded-xl border border-slate-800`
- Durum badge: `bg-{renk}-500/20 text-{renk}-400 rounded-full px-3 py-1 text-xs font-semibold`

---

## 13. Supabase Bağlantı Bilgileri

| Parametre | Değer |
|-----------|-------|
| **Project URL** | `https://xtjvbkhappiceyrlovkx.supabase.co` |
| **Anon Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (api.ts'te mevcut) |
| **Edge Function** | `/functions/v1/make-server-929c4905` |
| **Storage Buckets** | `backups`, `repair-photos`, `customer-photos` |

---

## 14. Dosya Boyut Referansı (Büyükten Küçüğe)

| Dosya | Boyut | Not |
|-------|-------|-----|
| ui/area-chart.tsx | 68KB | Visx tabanlı özel chart |
| CustomersPage.tsx | 53KB | En kapsamlı sayfa |
| RepairsPage.tsx | 49KB | Tamir sistemi |
| SalesPage.tsx | 43KB | Ana sayfa |
| api.ts | 32KB | Tüm API çağrıları |
| RemindersPage.tsx | 31KB | Hatırlatıcı sistemi |
| SuppliersPage.tsx | 30KB | Tedarikçi + cari |
| ExpensesPage.tsx | 27KB | Gider yönetimi |
| PhoneSalesPage.tsx | 28KB | Telefon satış |
| ProductsPage.tsx | 25KB | Ürün yönetimi |
| RepairPartsPage.tsx | 23KB | Parça stoğu |
| tacDatabase.ts | 19KB | IMEI veritabanı |
| AnalyticsPage.tsx | 19KB | Analizler |
| PurchasesPage.tsx | 18KB | Alışlar |
| BulkProductImportModal.tsx | 16KB | Excel import |
| AppointmentCalendar.tsx | 16KB | Randevu takvimi |
| AIForecastWidget.tsx | 15KB | AI tahmin |

---

> **⚠️ Bu dosyayı güncel tut!** Her büyük değişiklikte (yeni tablo, yeni sayfa, mimari değişiklik) bu dosyayı güncelle.
