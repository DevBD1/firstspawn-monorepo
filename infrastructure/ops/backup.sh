#!/bin/bash

# Cron için PATH tanımlaması
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# Herhangi bir hata oluşursa betiği durdur
set -e

DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_NAME="firstspawn_db_$DATE.sql.gz"
# rclone config dosyasındaki remote adı 'gdrive' ise burası doğru
REMOTE_PATH="gdrive:Backups/firstspawn-backups"
CONFIG_PATH="/home/deployer/.config/rclone/rclone.conf"

echo "[$DATE] Yedekleme işlemi başlatılıyor..."

# 1. PostgreSQL Dump al ve sıkıştır
# Not: docker komutunun tam yolunu 'which docker' ile teyit edebilirsin
/usr/bin/docker exec firstspawn-postgres /usr/bin/pg_dump -U firstspawn_admin firstspawn_prod | /usr/bin/gzip > /tmp/$BACKUP_NAME

echo "[$DATE] Veritabanı dökümü alındı: /tmp/$BACKUP_NAME"

# 2. Google Drive'a kopyala
/usr/bin/rclone --config "$CONFIG_PATH" copy /tmp/$BACKUP_NAME "$REMOTE_PATH"

echo "[$DATE] Yedek Google Drive'a başarıyla yüklendi."

# 3. Yerel geçici dosyayı temizle
/usr/bin/rm -f /tmp/$BACKUP_NAME

# 4. 30 günden eski yedekleri Drive'dan temizle
# 'delete' yerine 'deletefile' veya 'min-age' ile filtreleme kullanılır
/usr/bin/rclone --config "$CONFIG_PATH" --min-age 30d delete "$REMOTE_PATH"

echo "[$DATE] 30 günden eski yedekler temizlendi. İşlem tamamlandı."