#!/bin/sh

echo "wait for database to setup..."
while ! nc -z db 5432; do
	sleep 1
done

if [ -s /vault/token/root_token.txt ]; then
    echo "Root token found"
else
    echo "Root token not found"
    exit 1
fi

export VAULT_ADDR='https://vault:8201'
export VAULT_TOKEN=$(cat /vault/token/root_token.txt)
export VAULT_SKIP_VERIFY=true

POSTGRES_USER=$(vault kv get -field=POSTGRES_USER secret/app/config)
POSTGRES_PASSWORD=$(vault kv get -field=POSTGRES_PASSWORD secret/app/config)
POSTGRES_DB=$(vault kv get -field=POSTGRES_DB secret/app/config)
POSTGRES_HOST=$(vault kv get -field=POSTGRES_HOST secret/app/config)
POSTGRES_PORT=$(vault kv get -field=POSTGRES_PORT secret/app/config)
DJANGO_SECRET_KEY=$(vault kv get -field=DJANGO_SECRET_KEY secret/app/config)
EMAIL_HOST_USER=$(vault kv get -field=EMAIL_HOST_USER secret/app/config)
EMAIL_HOST_PASSWORD=$(vault kv get -field=EMAIL_HOST_PASSWORD secret/app/config)
export POSTGRES_USER=$POSTGRES_USER
export POSTGRES_PASSWORD=$POSTGRES_PASSWORD
export POSTGRES_DB=$POSTGRES_DB
export POSTGRES_HOST=$POSTGRES_HOST
export POSTGRES_PORT=$POSTGRES_PORT
export DJANGO_SECRET_KEY=$DJANGO_SECRET_KEY
export EMAIL_HOST_USER=$EMAIL_HOST_USER
export EMAIL_HOST_PASSWORD=$EMAIL_HOST_PASSWORD

sleep 10

python transcendence/manage.py makemigrations user_management
python transcendence/manage.py migrate
chmod 777 -R transcendence/transcendence/__pycache__
chmod 777 -R transcendence/user_management/__pycache__ 
chmod 777 -R transcendence/user_management/migrations

echo "Starting server..."
python transcendence/manage.py runserver 0.0.0.0:8000
