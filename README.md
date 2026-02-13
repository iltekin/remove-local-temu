# Yerel Satıcıları Gizle (Temu)

[![Chrome Web Mağazası'nda Mevcut](https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/i74j1a9z7g7b2j8k8k4h.png)](https://chromewebstore.google.com/detail/temu-hide-local-products/eahpdbpdonhoddncfbodpjaegkhcfalc)

> 🦊 **Firefox kullanıyorsanız** lütfen bu branch'i kullanınız: [https://github.com/iltekin/remove-local-temu/tree/firefox](https://github.com/iltekin/remove-local-temu/tree/firefox)

Bu Chrome eklentisi, Temu web sitesinde gezinirken yerel satıcılar tarafından satılan ürünleri otomatik olarak gizler ve yalnızca Temu tarafından doğrudan satılan (gönderilen) ürünleri görüntüler.

## Özellikler

-   Sayfadaki "Yerel Depodan" (Local Warehouse) ibaresi bulunan ürünleri otomatik olarak tespit eder.
-   Bu ürünleri listeden kaldırarak daha temiz bir görünüm sağlar.

## Kurulum

### Yöntem 1: Chrome Web Mağazası (Önerilen)
En kolay ve güvenli kurulum için eklentiyi resmi Chrome Web Mağazası'ndan yükleyebilirsiniz:
[👉 **Chrome'a Ekle**](https://chromewebstore.google.com/detail/temu-hide-local-products/eahpdbpdonhoddncfbodpjaegkhcfalc)

### Yöntem 2: Manuel Kurulum (Geliştiriciler İçin)
Eğer kaynak kodundan yüklemek isterseniz aşağıdaki adımları izleyin:

1.  **İndirme:**
    Eklentinin son sürümünü şu bağlantıdan indirin: [İndir (ZIP)](https://bit.ly/remove-local-temu)

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

Tebrikler! Eklenti başarıyla yüklendi. Artık Temu'da gezinirken eklenti otomatik olarak çalışacaktır.

## Geliştiren

**Sezer İltekin** - [x.com/sezeriltekin](https://x.com/sezeriltekin)

