const path = require('path');
const dotenv = require('dotenv');
const { z } = require('zod');

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .default('3004')
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value > 0, 'PORT must be a positive integer'),
  DATABASE_URL: z.string().optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  CORS_ORIGINS: z.string().optional(),
  PG_HOST: z.string().optional(),
  PG_PORT: z
    .string()
    .default('5432')
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value > 0, 'PG_PORT must be a positive integer'),
  PG_USER: z.string().optional(),
  PG_PASSWORD: z.string().optional(),
  PG_DATABASE: z.string().optional(),
  PG_SSL: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true')
});

const parsedEnv = envSchema.parse(process.env);

const config = {
  nodeEnv: parsedEnv.NODE_ENV,
  port: parsedEnv.PORT,
  databaseUrl: parsedEnv.DATABASE_URL,
  logLevel: parsedEnv.LOG_LEVEL,
  corsOrigins: parsedEnv.CORS_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? ['*'],
  postgres: {
    host: parsedEnv.PG_HOST,
    port: parsedEnv.PG_PORT,
    user: parsedEnv.PG_USER,
    password: parsedEnv.PG_PASSWORD,
    database: parsedEnv.PG_DATABASE,
    ssl: parsedEnv.PG_SSL
  }
};

module.exports = config;
