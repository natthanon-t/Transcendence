#!/bin/bash

sleep 5

if [ -s /vault/token/root_token.txt ]; then
    echo "Root token found"
else
    echo "Root token not found"
    exit 1
fi

export VAULT_SKIP_VERIFY=true
export VAULT_ADDR='https://vault:8201'
export VAULT_TOKEN=$(cat /vault/token/root_token.txt)
export GF_SECURITY_DISABLE_INITIAL_ADMIN_CHANGE=true

GF_SECURITY_ADMIN_USER=$(vault kv get -field=GF_SECURITY_ADMIN_USER secret/app/config)
GF_SECURITY_ADMIN_PASSWORD=$(vault kv get -field=GF_SECURITY_ADMIN_PASSWORD secret/app/config)

if [[ -z "$GF_SECURITY_ADMIN_USER" || -z "$GF_SECURITY_ADMIN_PASSWORD" ]]; then
    echo "Error: One or more required environment variables are missing!"
    exit 1
fi

export GF_SECURITY_ADMIN_USER=$GF_SECURITY_ADMIN_USER
export GF_SECURITY_ADMIN_PASSWORD=$GF_SECURITY_ADMIN_PASSWORD

exec /run.sh
