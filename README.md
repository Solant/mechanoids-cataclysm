# mechanoids-cataclysm

## Installation
* Clone repository
* Install postgres
* Create .env file in root folder with those values:
```dotenv
TOKEN = <telegram bot token>
TYPEORM_USERNAME = <db user>
TYPEORM_PASSWORD = <db user password>
TYPEORM_CONNECTION = postgres
TYPEORM_HOST = localhost
TYPEORM_DATABASE = cataclysm
TYPEORM_PORT = 5432
TYPEORM_ENTITIES = src/models/*.ts
TYPEORM_MIGRATIONS = src/migrations/*.ts
TYPEORM_MIGRATIONS_DIR = src/migrations
```

### Configure database
```bash
npm run typeorm schema:sync
npm run typeorm migration:run
```