# 🛡️ FirstSpawn Veritabanı Yedekleme ve Kurtarma Rehberi

> **Bu doküman ne anlatır** — Stack'in PostgreSQL veritabanını yedekleme ve geri
> yükleme adımları.
>
> **Şu durumlarda açın** — Yedek kurarken, alırken veya bir yedeği geri yüklerken.

Bu doküman, FirstSpawn monorepo altyapısının PostgreSQL veritabanını Google Drive üzerine yedekleme ve olası bir felaket anında geri yükleme adımlarını içerir.

---

## 1. Kurulum ve Yapılandırma (rclone)

### Sunucu Tarafı (Hetzner VPS)
1. **Kurulum:** `sudo apt install rclone`
2. **Yapılandırma:** `rclone config`
   - `n` (New remote) -> isim: `gdrive` -> tip: `drive`
   - Client ID ve Secret: (Boş bırakılabilir veya performans için özel oluşturulabilir).
   - `Advanced config`: No
   - `Use auto config?`: **No** (Sunucuda tarayıcı olmadığı için).
   - MacBook'tan aldığın `token`ı buraya yapıştır.

### Yerel Taraf (MacBook - Auth İçin)
1. **Kurulum:** `brew install rclone`
2. **Yetkilendirme:** Sunucunun verdiği `rclone authorize "drive" "..."` komutunu çalıştır ve tarayıcıdan onay verip çıkan kodu sunucuya ilet.

---

## 2. Otomatik Yedekleme Scripti

`/home/deployer/scripts/backup.sh` yolunda saklanır:

```bash
#!/bin/bash
# Değişkenler
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_NAME="firstspawn_db_$DATE.sql.gz"
LOCAL_TMP="/tmp/$BACKUP_NAME"
REMOTE_PATH="gdrive:Backups/firstspawn-backups"

# 1. Dump & Compress (Docker üzerinden)
docker exec firstspawn-postgres pg_dump -U firstspawn_admin firstspawn_prod | gzip > $LOCAL_TMP

# 2. Google Drive'a Gönder
rclone copy $LOCAL_TMP $REMOTE_PATH

# 3. Yerel Geçici Dosyayı Sil
rm $LOCAL_TMP

# 4. Retention Policy (30 günden eski yedekleri sil)
rclone delete $REMOTE_PATH --min-age 30d
```

## 3. Otomasyon (CronJob)
Yedeklemenin her gece 03:00'te çalışması için:

```crontab -e```

En alta ekle: ```0 3 * * * /bin/bash /home/deployer/scripts/backup.sh >> /home/deployer/scripts/backup.log 2>&1```

## 4. Kurtarma (Recovery) Senaryosu
Veritabanı çöktüğünde veya veriler bozulduğunda:

Yedeği İndir:
```rclone copy gdrive:Backups/firstspawn-backups/DOSYA_ADI.sql.gz .```

Zipten Çıkar:
```gunzip DOSYA_ADI.sql.gz```

Veriyi Geri Yükle:
```cat DOSYA_ADI.sql | docker exec -i firstspawn-postgres psql -U firstspawn_admin -d firstspawn_prod```

## 5. Kritik Notlar
Şifreler: Scriptin çalışması için .env dosyasındaki DB bilgilerinin doğruluğundan emin olun.

İzleme: backup.log dosyasını periyodik olarak kontrol ederek yedeklerin başarıyla yüklendiğini teyit edin.

Güvenlik: Google Drive hesabınızda 2FA (İki Faktörlü Doğrulama) açık olduğundan emin olun.

---