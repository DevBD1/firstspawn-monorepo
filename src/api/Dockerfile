# /src/api/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Sistem bağımlılıkları (PostgreSQL bağlantısı için)
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# PYTHONPATH tanımlıyoruz (Kritik adım)
ENV PYTHONPATH=/app

# Bağımlılıkları kopyala ve kur
COPY src/api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Tüm monorepo yerine sadece gerekli kısımları kopyala (SoC)
# COPY src/api/ ./src/api/

# Tüm kodları kopyala
COPY . .

# Eğer paylaşımlı paketlerin varsa buraya ekle: COPY packages/ ./packages/

WORKDIR /app

# IPv6 üzerinden dinlemek için :: adresini kullanıyoruz
# Çalıştırma dizini olarak API klasörünü belirle veya absolute path kullan
# CMD ["uvicorn", "src.api.app.main:app", "--host", "::", "--port", "8000"]
CMD ["uvicorn", "app.main:app", "--app-dir", "src/api", "--host", "::", "--port", "8000"]