import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
    format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:MM:ss.SSS' }),
        format.align(),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
    ),
    level: 'info',
    transports: [
        new transports.Console(),
    ],
});
