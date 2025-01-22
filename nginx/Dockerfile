FROM nginx:1.18.0

# ติดตั้ง ModSecurity
RUN apt-get update && apt-get install -y \
    libmodsecurity3 \
    libmodsecurity-dev \
    && rm -rf /var/lib/apt/lists/*

# ตั้งค่า ModSecurity
COPY modsecurity.conf /etc/nginx/modsec/modsecurity.conf
COPY modsec-nginx.conf /etc/nginx/modsec-nginx.conf

# ติดตั้งไฟล์ nginx.conf สำหรับ Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# ตั้งค่าไฟล์เซอร์วิส Nginx
RUN ln -s /etc/nginx/modsec/modsecurity.conf /etc/nginx/modsecurity.conf
