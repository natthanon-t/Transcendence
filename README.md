# Project Setup

## Requirements
- Make sure you have `make` installed on your system.
- Ensure you have all required dependencies installed.

## Setup
1. Copy the sample environment file:
   ```sh
   mv sample.env .env
   ```
2. Start the project using `make`:
   ```sh
   make up
   ```

## Sample `.env` File
```
POSTGRES_DB=userdb
POSTGRES_USER=userdb
POSTGRES_PASSWORD=userdb
POSTGRES_HOST=db
POSTGRES_PORT=5432
DJANGO_SECRET_KEY=userdb
GF_SECURITY_ADMIN_USER=admin_grafana
GF_SECURITY_ADMIN_PASSWORD=admin_grafana
```

## Available Commands
- `make` - Run the default make command.
- `make up` - Start the application.
- `make down` - Stop the application.
- `make hard_clean` - Remove all generated files and clean the environment.

## Notes
- Update the `.env` file with your specific configurations before starting the application.

