FROM postgres:17-bookworm
USER root
# install vault
RUN apt-get update && \
    apt-get install -y wget unzip && \
    wget https://releases.hashicorp.com/vault/1.5.3/vault_1.5.3_linux_amd64.zip && \
    unzip -o vault_1.5.3_linux_amd64.zip -d /usr/local/bin/ && \
    rm vault_1.5.3_linux_amd64.zip && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ADD script.sh /usr/local/bin/script.sh
RUN chmod +x /usr/local/bin/script.sh

ENTRYPOINT ["script.sh"]
