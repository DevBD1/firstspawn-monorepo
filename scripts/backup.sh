#!/bin/bash
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_NAME="firstspawn_db_$DATE.sql.gz"
REMOTE_PATH="gdrive:Backups/firstspawn-backups"

echo "Yedekleme başlıyor: $BACKUP_NAME"

# 1. Dump al
docker exec firstspawn-postgres pg_dump -U firstspawn_admin firstspawn_prod | gzip > /tmp/$BACKUP_NAME

# 2. Drive'a kopyala
rclone copy /tmp/$BACKUP_NAME $REMOTE_PATH

# 3. Yerel dosyayı temizle
rm /tmp/$BACKUP_NAME

# 4. 30 günden eski yedekleri Drive'dan temizle (Temizlik aşaması)
rclone delete $REMOTE_PATH --min-age 30d

echo "Yedekleme ve temizlik başarıyla tamamlandı."