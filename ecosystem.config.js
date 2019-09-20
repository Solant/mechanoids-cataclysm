require('dotenv').config();

module.exports = {
    apps: [{
        name: 'Mechanoids Telegram Bot',
        script: 'ts-node',
        args: 'src/index.ts',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'development',
        },
        env_production: {
            NODE_ENV: 'production',
        },
        out_file: '../out.log',
        log_file: '../combined.log',
    }],

    deploy: {
        production: {
            user: process.env.DEPLOY_USER,
            host: process.env.DEPLOY_HOST,
            ref: 'origin/master',
            repo: 'https://github.com/Solant/mechanoids-cataclysm.git',
            path: '/home/debian/mechanoids-cataclysm',
            'post-deploy': 'npm install && npm run db:init && npx pm2 startOrRestart ecosystem.config.js --env production',
            env: {
                TOKEN: process.env.TOKEN,
                TYPEORM_CONNECTION: process.env.TYPEORM_CONNECTION,
                TYPEORM_HOST: process.env.TYPEORM_HOST,
                TYPEORM_PORT: process.env.TYPEORM_PORT,
                TYPEORM_DATABASE: process.env.TYPEORM_DATABASE,
                TYPEORM_USERNAME: process.env.TYPEORM_USERNAME,
                TYPEORM_PASSWORD: process.env.TYPEORM_PASSWORD,
                TYPEORM_MIGRATIONS: process.env.TYPEORM_MIGRATIONS,
                TYPEORM_ENTITIES: process.env.TYPEORM_ENTITIES,
                TYPEORM_MIGRATIONS_TABLE_NAME: process.env.TYPEORM_MIGRATIONS_TABLE_NAME,
                TYPEORM_MIGRATIONS_DIR: process.env.TYPEORM_MIGRATIONS_DIR,
                TYPEORM_ENTITIES_DIR: process.env.TYPEORM_ENTITIES_DIR,
            },
        },
    },
};
