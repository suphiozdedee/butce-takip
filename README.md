# Suphi Finance — Premium Finans Paneli

Bu paket tek sayfalık, bağımsız çalışan bir HTML/CSS/JS finans panelidir. Kurulum gerektirmez.

## Nasıl çalıştırılır?

1. ZIP dosyasını çıkar.
2. `index.html` dosyasını çift tıkla.
3. Tarayıcıda açılır.

## Ana mantık

- **Kasa / Net Nakit:** Sadece vadesiz hesaplardaki gerçek para.
- **Kredi kartları:** Kart borcu ve kullanılabilir limit ayrı takip edilir. Kasaya eklenmez.
- **Krediler:** Kredi borcu ayrı yükümlülük olarak durur.
- **Minimum ödeme:** Kart minimumları + kredi taksitleri + sabit giderler ile hesaplanır.
- **Sabit giderler:** Her ay 1–5 arası ödeme aralığında görünür. Tutarlar sonradan güncellenebilir.
- **Tarih:** Yeni işlem eklerken tarih otomatik bugünün tarihi gelir. Geçmiş tarih girmek manuel yapılır.

## Logo notu

`assets/logos` içindeki SVG dosyaları logo slotu/yer tutucu olarak hazırlandı. Bankaların resmi marka dosyalarını kullanmak istersen aynı dosya isimleriyle değiştir:

- `garanti-bbva.svg`
- `yapi-kredi.svg`
- `enpara.svg`
- `visa.svg`
- `mastercard.svg`

## Veri saklama

Veriler tarayıcının `localStorage` alanında saklanır. Başka cihazla otomatik senkronize olmaz.

## Sıfırlama

Panelin üstündeki `↺` butonu demo verileri sıfırlar.
