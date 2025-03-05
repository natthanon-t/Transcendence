FROM grafana/grafana:11.4.2-ubuntu

USER root

# Set working directory
WORKDIR /etc/grafana

# Install openssl for certificate generation
RUN apt-get update && apt-get install -y openssl

RUN apt-get install -y wget unzip && \
    wget https://releases.hashicorp.com/vault/1.18.0/vault_1.18.0_linux_amd64.zip && \
    unzip -o vault_1.18.0_linux_amd64.zip -d /usr/local/bin/ && \
    rm vault_1.18.0_linux_amd64.zip && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN openssl req -x509 -nodes -days 365 -newkey rsa:4096 \
    -keyout /etc/grafana/server.key -out /etc/grafana/server.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/OU=Department/CN=localhost"

# Set correct permissions for certificate and key
RUN chmod 644 /etc/grafana/server.key /etc/grafana/server.crt

# Copy custom Grafana configuration
COPY grafana.ini /etc/grafana/grafana.ini
COPY script.sh /usr/local/bin/script.sh

RUN chmod +x /usr/local/bin/script.sh

# Expose HTTPS port
EXPOSE 3000

# Run Grafana
ENTRYPOINT ["script.sh"]
