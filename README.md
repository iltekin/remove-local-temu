# Yerel Satıcıları Gizle (Temu)

Bu tarayıcı eklentisi (**Chrome** & **Firefox**), Temu web sitesinde gezinirken yerel satıcılar tarafından satılan ürünleri otomatik olarak gizler ve yalnızca Temu tarafından doğrudan satılan (gönderilen) ürünleri görüntüler.

## Özellikler

-   Sayfadaki "Yerel Depodan" (Local Warehouse) ibaresi bulunan ürünleri otomatik olarak tespit eder.
-   Bu ürünleri listeden kaldırarak daha temiz bir görünüm sağlar.

## Kurulum

Bu eklenti Chrome Web Mağazası'nda bulunmamaktadır. Manuel olarak yüklemek için aşağıdaki adımları izleyin:

1.  **İndirme:**
    Eklentinin son sürümünü şu bağlantıdan indirin: [İndir (ZIP)](https://github.com/iltekin/remove-local-temu/archive/refs/heads/main.zip)

2.  **Dosyaları Çıkarma:**
    İndirdiğiniz `.zip` dosyasını sağ tıklayıp "Tümünü Ayıkla" veya "Buraya Çıkart" diyerek bir klasöre çıkartın.

3.  **Chrome Uzantılar Sayfasını Açma:**
    Google Chrome tarayıcısını açın ve adres çubuğuna şunu yazıp Enter'a basın:
    `chrome://extensions/`

4.  **Geliştirici Modunu Açma:**
    Sayfanın sağ üst köşesindeki **"Geliştirici modu" (Developer mode)** anahtarını açık konuma getirin.

5.  **Eklentiyi Yükleme:**
    Sol üstte beliren **"Paketlenmemiş öğe yükle" (Load unpacked)** butonuna tıklayın.

6.  **Klasörü Seçme:**
    2. adımda ayıkladığınız klasörü (içinde `manifest.json` dosyası olan klasörü) seçin ve "Seç" veya "Tamam" butonuna tıklayın.

### Firefox

1.  **Eklenti Hata Ayıklama Sayfasını Açma:**
    Firefox'u açın ve adres çubuğuna şunu yazıp Enter'a basın:
    `about:debugging#/runtime/this-firefox`

2.  **Geçici Eklenti Yükleme:**
    **"Geçici Eklenti Yükle…" (Load Temporary Add-on…)** butonuna tıklayın.

3.  **Manifest Dosyasını Seçme:**
    Ayıkladığınız klasördeki `manifest.json` dosyasını seçin ve "Aç" butonuna tıklayın.

> **Not:** Firefox'ta geçici eklentiler tarayıcı kapandığında kaldırılır.

Tebrikler! Eklenti başarıyla yüklendi. Artık Temu'da gezinirken eklenti otomatik olarak çalışacaktır.

## Geliştiren

**Sezer İltekin** - [x.com/sezeriltekin](https://x.com/sezeriltekin)

