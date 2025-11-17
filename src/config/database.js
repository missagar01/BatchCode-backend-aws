const { Pool } = require('pg');
const config = require('./env');
const { logger } = require('../utils/logger');

let pool;

const buildConnectionOptions = () => {
  if (config.databaseUrl) {
    return {
      connectionString: config.databaseUrl,
      ssl: config.postgres.ssl ? { rejectUnauthorized: false } : false
    };
  }

  const { host, port, user, password, database, ssl } = config.postgres;
  if (!host || !user || !database) {
    return null;
  }

  return {
    host,
    port,
    user,
    password,
    database,
    ssl: ssl ? { rejectUnauthorized: false } : false
  };
};

const ensureQcLabSamplesTable = async () => {
  const ddl = `
    CREATE TABLE IF NOT EXISTS qc_lab_samples (
      id SERIAL PRIMARY KEY,
      sms_batch_code TEXT,
      sampled_furnace_number TEXT,
      sampled_sequence TEXT,
      sampled_laddle_number TEXT,
      shift TEXT,
      final_c NUMERIC(10,4),
      final_mn NUMERIC(10,4),
      final_s NUMERIC(10,4),
      final_p NUMERIC(10,4),
      sample_tested_by TEXT,
      remarks TEXT,
      test_report_picture TEXT,
      code TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await pool.query(ddl);
  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_qc_lab_samples_code ON qc_lab_samples (code)');
  logger.info('Ensured qc_lab_samples table and unique code index exist');
};

const ensureSmsRegisterTable = async () => {
  const ddl = `
    CREATE TABLE IF NOT EXISTS sms_register (
      id SERIAL PRIMARY KEY,
      sample_timestamp TIMESTAMPTZ,
      sequence_number TEXT,
      laddle_number INTEGER,
      sms_head TEXT,
      furnace_number TEXT,
      remarks TEXT,
      shift_incharge TEXT,
      temprature INTEGER,
      unique_code TEXT
    )
  `;
  await pool.query(ddl);
  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_sms_register_unique_code ON sms_register (unique_code)');
  logger.info('Ensured sms_register table and unique code index exist');
};

const ensureHotCoilTable = async () => {
  const ddl = `
    CREATE TABLE IF NOT EXISTS hot_coil (
      id SERIAL PRIMARY KEY,
      sample_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      sms_short_code TEXT,
      submission_type TEXT,
      size TEXT,
      mill_incharge TEXT,
      quality_supervisor TEXT,
      picture TEXT,
      electrical_dc_operator TEXT,
      remarks TEXT,
      strand1_temperature TEXT,
      strand2_temperature TEXT,
      shift_supervisor TEXT,
      unique_code TEXT
    )
  `;
  await pool.query(ddl);
  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_hot_coil_unique_code ON hot_coil (unique_code)');
  await pool.query('ALTER TABLE hot_coil ADD COLUMN IF NOT EXISTS submission_type TEXT');
  await pool.query('ALTER TABLE hot_coil ADD COLUMN IF NOT EXISTS picture TEXT');
  logger.info('Ensured hot_coil table and unique code index exist');
};

const connectDatabase = async () => {
  if (pool) {
    return pool;
  }

  const options = buildConnectionOptions();
  if (!options) {
    logger.warn('Database configuration missing. Skipping database connection.');
    return null;
  }

  try {
    pool = new Pool(options);
    pool.on('error', (error) => {
      logger.error('Unexpected PostgreSQL client error', error);
    });

    await pool.query('SELECT 1');
    logger.info('Database connection established');

    await ensureQcLabSamplesTable();
    await ensureSmsRegisterTable();
    await ensureHotCoilTable();
    return pool;
  } catch (error) {
    logger.error('Database connection failed', error);
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database has not been initialized. Call connectDatabase() first.');
  }
  return pool;
};

module.exports = { connectDatabase, getPool };
