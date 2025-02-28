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

sleep 10

python transcendence/manage.py makemigrations user_management
python transcendence/manage.py migrate

echo "Starting server..."
python transcendence/manage.py runserver 0.0.0.0:8000
