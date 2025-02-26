# Project Setup

## Requirements
- Make sure you have `make` installed on your system.
- Ensure you have all required dependencies installed.

## Setup
1. Copy the sample environment file:
   ```sh
   cp sample.env .env
   ```
2. Start the project using `make`:
   ```sh
   make up
   ```

## Available Commands
- `make` - Run the default make command.
- `make up` - Start the application.
- `make down` - Stop the application.
- `make hard_clean` - Remove all generated files and clean the environment.

## Notes
- Update the `.env` file with your specific configurations before starting the application.

