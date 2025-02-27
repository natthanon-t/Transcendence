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
POSTGRES_DB=$(vault kv get -field=POSTGRES_DB secret/app/config)

if [[ -z "$POSTGRES_USER" || -z "$POSTGRES_PASSWORD" || -z "$POSTGRES_DB" ]]; then
    echo "Error: One or more required environment variables are missing!"
    exit 1
fi

echo "export POSTGRES_USER=$POSTGRES_USER" > /envfile
echo "export POSTGRES_PASSWORD=$POSTGRES_PASSWORD" >> /envfile
echo "export POSTGRES_DB=$POSTGRES_DB" >> /envfile

source /envfile

exec docker-entrypoint.sh postgres
