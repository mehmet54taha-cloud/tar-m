# Filiz — Öğrendiklerin kök salsın

Dokuz tarım dersi için kişisel öğrenme alanı. React, Vite, Lucide ve PDF.js ile hazırlanmıştır.

1. Akıllı Tarım
2. Bitki fizyolojisi
3. Genetik
4. Gıda bilimi ve güvenliği
5. Hayvansal üretim
6. İstatistik
7. Tarımsal mekanizasyon
8. Tarımsal yapılar ve sulama
9. Toprak bilgisi

Konular ve kartlar boş başlar. Her derse konu, not ve dosya eklenebilir. Konuların durumu Başlanmadı → Çalışılıyor → Tamamlandı olarak değiştirilebilir. Konuyu silmek bağlı dosyaları ve kartları da siler; önce onay istenir.

## Geliştirme

Node.js 24 ve npm gerekir. Mevcut `/workspace/tar-m` checkout'unu kullanın; açıkça istenmedikçe ek Git worktree oluşturmayın.

```sh
cd /workspace/tar-m
npm ci --cache /workspace/.cache/npm
npm run dev
```

## Üretim

```sh
npm run build
npm start
```

`npm start`, `dist` klasörünü 3000 portundan sunar. İstenirse `PORT` değişkeni verilebilir. Harici bir servis, veritabanı veya API anahtarı gerekmez. Yazı tipleri ve PDF işçisi yerel paketlerden sunulur. `dist` klasörü herhangi bir HTTPS statik sunucuya yüklenebilir. Göreli varlık adresleri sayesinde GitHub Pages alt dizinleri desteklenir.

## Test

```sh
npm test
```

Playwright, varsayılan olarak `/usr/bin/chromium` kullanır ve 3000 portundaki çalışan üretim sunucusuna bağlanır. Alternatif tarayıcı için `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` tanımlanabilir. Testler izole tarayıcı verileri kullanır. Dokuz dersin sırasını, konu ekleme/düzenleme/silme, durum değişimi, dosya indirme, PDF metin çıkarma, kart oluşturma/düzenleme, aralıklı tekrar, sayfa yenileme sonrası kalıcılık, dosyalı yedekleme/geri yükleme ve mobil taşma kontrolünü doğrular.

## Verilerin saklanması

- Konular, kartlar ve dosyalar IndexedDB ile ziyaretçinin kendi tarayıcısında tutulur.
- Otomatik cihazlar arası eşitleme, kullanıcı hesabı ve sunucuya dosya yükleme yoktur.
- Tarayıcı verilerini temizlemek verileri siler. “Yedekle ve aktar” ile dosyaları da içeren JSON yedeği alın ve güvenli bir yerde saklayın.
- Yedek geri yüklemesi mevcut konu ve kartların yerini alır; uygulama önce onay ister.
- Dosya başına sınır 25 MB'dir. Toplam kapasite tarayıcının depolama kotasına bağlıdır.
- Site adresi veya tarayıcı değişince önceki veriler kendiliğinden aktarılmaz; yedekten geri yüklenmelidir.

## PDF ve kart taslakları

Metin içeren PDF'lerin ilk 100 sayfası ve TXT/MD/CSV dosyaları tarayıcıda okunur. Taranmış PDF'ler için OCR yoktur; böyle bir durumda not ekleyin. DOCX ve diğer dosyalar saklanıp indirilebilir, ancak metinleri otomatik analiz edilmez.

“Kavram: Açıklama” biçimindeki satırlar soru-cevap kartına, diğer uygun cümleler boşluk doldurma kartına dönüşür. Her üretimde en fazla 12 taslak çıkarılır. Taslakları kaydetmeden önce değiştirebilir veya kaldırabilirsiniz. Harici yapay zekâ servisi kullanılmaz; kaynakta olmayan bilgi üretilmez. Elle kart oluşturma her zaman mümkündür. Kaynak notu değiştirilince mevcut kartlar otomatik değiştirilmez; yeniden taslak çıkarabilir veya kartı düzenleyebilirsiniz.

Tekrarda Tekrar/Zor/İyi/Kolay seçimi bir sonraki tekrar tarihini belirler. “Tekrar” 10 dakika, ilk “İyi” 1 gün, ilk “Kolay” 4 gün sonrasını planlar.

## GitHub Pages yayını

`.github/workflows/deploy.yml`, `main` dalına yapılan her push sonrasında üretim paketini GitHub Pages'e yükler. İlk yayında deponun **Settings → Pages → Build and deployment → Source** ayarı **GitHub Actions** olmalıdır. Ardından **Actions → Publish Filiz to GitHub Pages → Run workflow** çalıştırılabilir.

Öngörülen adres `https://mehmet54taha-cloud.github.io/tar-m/` olur; bu adresin aktif olduğu dağıtım tamamlanmadan varsayılmamalıdır. API ile ayar yapmak için `api.github.com` erişimi ve uygun GitHub depo yetkisi gerekir. Kaynak kodunun GitHub'a gönderilmiş olması tek başına sitenin yayınlandığını göstermez.
