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

POSTGRES_USER=$(vault kv get -field=POSTGRES_USER secret/app/config)
POSTGRES_PASSWORD=$(vault kv get -field=POSTGRES_PASSWORD secret/app/config)
POSTGRES_HOST=$(vault kv get -field=POSTGRES_HOST secret/app/config)
POSTGRES_PORT=$(vault kv get -field=POSTGRES_PORT secret/app/config)
POSTGRES_DB=$(vault kv get -field=POSTGRES_DB secret/app/config)

if [[ -z "$POSTGRES_USER" || -z "$POSTGRES_PASSWORD" || -z "$POSTGRES_DB" || -z "$POSTGRES_HOST" || -z "$POSTGRES_PORT" ]]; then
    echo "Error: One or more required environment variables are missing!"
    exit 1
fi

export POSTGRES_USER=$POSTGRES_USER
export POSTGRES_PASSWORD=$POSTGRES_PASSWORD
export POSTGRES_HOST=$POSTGRES_HOST
export POSTGRES_PORT=$POSTGRES_PORT
export POSTGRES_DB=$POSTGRES_DB

export DATA_SOURCE_NAME=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?sslmode=disable

exec /postgres_exporter
