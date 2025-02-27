FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y && apt-get upgrade -y \
    curl \
    gnupg \
    jq \
    procps && \
    rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com bookworm main" | tee /etc/apt/sources.list.d/vault.list && \
    apt-get update && apt-get install -y vault && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /vault/config/certs
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /vault/config/certs/server.key -out /vault/config/certs/server.crt -subj "/C=US/ST=CA/L=San Francisco/O=Vault/OU=IT Department/CN=vault"
#RUN chmod 777 /vault/config/certs/server.crt && chmod 777 /vault/config/certs/server.key

RUN mkdir -p /vault/token

EXPOSE 8200

COPY config/vault.hcl /vault/config/vault.hcl

COPY script.sh /vault/script.sh

RUN chmod +x /vault/script.sh

WORKDIR /vault

ENTRYPOINT ["/vault/script.sh"]
