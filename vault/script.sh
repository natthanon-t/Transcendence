#!/bin/bash

pkill vault
rm -rf /vault/data/*

# Start Vault in the background, redirecting the output to a file and stderror to stdout
vault server -dev -config=/vault/config/vault.hcl > /tmp/init_vault.log 2>&1 &

sleep 5

# Retrieve root token and store it
cat /tmp/init_vault.log
root_token=$(grep -oP 'Root Token: \K.*' /tmp/init_vault.log)
echo -n "$root_token" > /vault/token/root_token.txt
echo "Root token: $root_token"
export VAULT_TOKEN="$root_token"

vault kv put secret/app/config POSTGRES_DB="$POSTGRES_DB" \
                                POSTGRES_USER="$POSTGRES_USER" \
                                POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
                                POSTGRES_HOST="$POSTGRES_HOST" \
                                POSTGRES_PORT="$POSTGRES_PORT" \
								DJANGO_SECRET_KEY="$DJANGO_SECRET_KEY"

# list all secrets
vault kv get secret/app/config

# Keep the script running or exit
tail -f /dev/null