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

      sample_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      sms_batch_code VARCHAR(50) NOT NULL,
      furnace_number VARCHAR(50) NOT NULL,
      sequence_code VARCHAR(10) NOT NULL,
      laddle_number INTEGER NOT NULL,
      shift_type VARCHAR(20) NOT NULL,

      final_c NUMERIC(10,4),
      final_mn NUMERIC(10,4),
      final_s NUMERIC(10,4),
      final_p NUMERIC(10,4),

      tested_by VARCHAR(100),
      remarks TEXT,
      report_picture TEXT,
      unique_code VARCHAR(50),

      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await pool.query(ddl);
  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_qc_lab_samples_unique_code ON qc_lab_samples (unique_code)');
  logger.info('Ensured qc_lab_samples table and unique code index exist');
};

const ensureSmsRegisterTable = async () => {
  const ddl = `
    CREATE TABLE IF NOT EXISTS sms_register (
      id SERIAL PRIMARY KEY,

      sample_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      sequence_number VARCHAR(10),
      laddle_number INTEGER,

      sms_head VARCHAR(150),
      furnace_number VARCHAR(50),

      remarks TEXT,
      picture TEXT,

      shift_incharge VARCHAR(100),
      temperature INTEGER,

      unique_code VARCHAR(50) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await pool.query(ddl);
  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_sms_register_unique_code ON sms_register (unique_code)');
  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'sms_register' AND column_name = 'temprature'
      ) THEN
        ALTER TABLE sms_register RENAME COLUMN temprature TO temperature;
      END IF;
    END $$;
  `);
  await pool.query('ALTER TABLE sms_register ADD COLUMN IF NOT EXISTS picture TEXT');
  await pool.query('ALTER TABLE sms_register ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()');
  await pool.query('ALTER TABLE sms_register ALTER COLUMN sample_timestamp SET DEFAULT CURRENT_TIMESTAMP');
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

const ensurePipeMillTable = async () => {
  const ddl = `
    CREATE TABLE IF NOT EXISTS pipe_mill (
      id SERIAL PRIMARY KEY,

      sample_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      recoiler_short_code VARCHAR(50) NOT NULL,
      mill_number VARCHAR(100) NOT NULL,
      section VARCHAR(50),
      item_type VARCHAR(50),

      quality_supervisor VARCHAR(100) NOT NULL,
      mill_incharge VARCHAR(100) NOT NULL,
      forman_name VARCHAR(100) NOT NULL,
      fitter_name VARCHAR(100) NOT NULL,

      shift VARCHAR(20) NOT NULL,
      size VARCHAR(50) NOT NULL,
      thickness VARCHAR(30),

      remarks TEXT,
      picture TEXT,

      unique_code VARCHAR(50) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await pool.query(ddl);
  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_pipe_mill_unique_code ON pipe_mill (unique_code)');
  await pool.query('ALTER TABLE pipe_mill ALTER COLUMN sample_timestamp SET DEFAULT CURRENT_TIMESTAMP');
  await pool.query('ALTER TABLE pipe_mill ADD COLUMN IF NOT EXISTS section VARCHAR(50)');
  await pool.query('ALTER TABLE pipe_mill ADD COLUMN IF NOT EXISTS item_type VARCHAR(50)');
  await pool.query('ALTER TABLE pipe_mill ADD COLUMN IF NOT EXISTS thickness VARCHAR(30)');
  await pool.query('ALTER TABLE pipe_mill ADD COLUMN IF NOT EXISTS picture TEXT');
  await pool.query('ALTER TABLE pipe_mill ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()');
  logger.info('Ensured pipe_mill table and unique code index exist');
};

const ensureReCoilerTable = async () => {
  const ddl = `
    CREATE TABLE IF NOT EXISTS re_coiler (
      id SERIAL PRIMARY KEY,

      sample_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      hot_coiler_short_code VARCHAR(50) NOT NULL,
      size VARCHAR(50),
      supervisor VARCHAR(100),
      incharge VARCHAR(100),
      contractor VARCHAR(100),
      machine_number VARCHAR(50),
      welder_name VARCHAR(100),

      unique_code VARCHAR(50) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await pool.query(ddl);
  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_re_coiler_unique_code ON re_coiler (unique_code)');
  await pool.query('ALTER TABLE re_coiler ALTER COLUMN sample_timestamp SET DEFAULT CURRENT_TIMESTAMP');
  await pool.query('ALTER TABLE re_coiler ADD COLUMN IF NOT EXISTS size VARCHAR(50)');
  await pool.query('ALTER TABLE re_coiler ADD COLUMN IF NOT EXISTS supervisor VARCHAR(100)');
  await pool.query('ALTER TABLE re_coiler ADD COLUMN IF NOT EXISTS incharge VARCHAR(100)');
  await pool.query('ALTER TABLE re_coiler ADD COLUMN IF NOT EXISTS contractor VARCHAR(100)');
  await pool.query('ALTER TABLE re_coiler ADD COLUMN IF NOT EXISTS machine_number VARCHAR(50)');
  await pool.query('ALTER TABLE re_coiler ADD COLUMN IF NOT EXISTS welder_name VARCHAR(100)');
  await pool.query('ALTER TABLE re_coiler ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()');
  await pool.query('ALTER TABLE re_coiler ALTER COLUMN unique_code SET NOT NULL');
  logger.info('Ensured re_coiler table and unique code index exist');
};

const ensureLaddleChecklistTable = async () => {
  const ddl = `
    CREATE TABLE IF NOT EXISTS laddle_checklist (
      id SERIAL PRIMARY KEY,

      sample_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      sample_date DATE NOT NULL,
      laddle_number INTEGER NOT NULL,

      slag_cleaning_top VARCHAR(50),
      slag_cleaning_bottom VARCHAR(50),
      nozzle_proper_lancing VARCHAR(50),
      pursing_plug_cleaning VARCHAR(50),
      sly_gate_check VARCHAR(50),
      nozzle_check_cleaning VARCHAR(50),
      sly_gate_operate VARCHAR(50),
      nfc_proper_heat VARCHAR(50),
      nfc_filling_nozzle VARCHAR(50),

      plate_life INTEGER,

      timber_man_name VARCHAR(100),
      laddle_man_name VARCHAR(100),
      laddle_foreman_name VARCHAR(100),
      supervisor_name VARCHAR(100),

      unique_code VARCHAR(50) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await pool.query(ddl);
  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_laddle_checklist_unique_code ON laddle_checklist (unique_code)');
  await pool.query('ALTER TABLE laddle_checklist ALTER COLUMN sample_timestamp SET DEFAULT CURRENT_TIMESTAMP');
  await pool.query('ALTER TABLE laddle_checklist ALTER COLUMN sample_date TYPE DATE USING sample_date::date');
  await pool.query('ALTER TABLE laddle_checklist ALTER COLUMN sample_date SET NOT NULL');
  await pool.query('ALTER TABLE laddle_checklist ALTER COLUMN laddle_number TYPE INTEGER USING laddle_number::integer');
  await pool.query('ALTER TABLE laddle_checklist ALTER COLUMN laddle_number SET NOT NULL');
  await pool.query('ALTER TABLE laddle_checklist ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()');
  await pool.query('ALTER TABLE laddle_checklist ALTER COLUMN unique_code SET NOT NULL');
  logger.info('Ensured laddle_checklist table and unique code index exist');
};

const ensureLaddleReturnTable = async () => {
  const ddl = `
    CREATE TABLE IF NOT EXISTS laddle_return (
      id SERIAL PRIMARY KEY,

      sample_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      laddle_return_date DATE NOT NULL,
      laddle_return_time TIME NOT NULL,

      poring_temperature VARCHAR(100),
      poring_temperature_photo TEXT,

      furnace_shift_incharge VARCHAR(100),
      furnace_crane_driver VARCHAR(100),

      ccm_temperature_before_pursing VARCHAR(100),
      ccm_temp_before_pursing_photo TEXT,
      ccm_temp_after_pursing_photo TEXT,

      ccm_crane_driver VARCHAR(100),
      stand1_mould_operator VARCHAR(100),
      stand2_mould_operator VARCHAR(100),

      shift_incharge VARCHAR(100),
      timber_man VARCHAR(100),
      operation_incharge VARCHAR(100),

      laddle_return_reason TEXT,
      unique_code VARCHAR(20) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await pool.query(ddl);
  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_laddle_return_unique_code ON laddle_return (unique_code)');
  await pool.query('ALTER TABLE laddle_return ALTER COLUMN sample_timestamp SET DEFAULT CURRENT_TIMESTAMP');
  await pool.query('ALTER TABLE laddle_return ALTER COLUMN laddle_return_date TYPE DATE USING laddle_return_date::date');
  await pool.query('ALTER TABLE laddle_return ALTER COLUMN laddle_return_date SET NOT NULL');
  await pool.query('ALTER TABLE laddle_return ALTER COLUMN laddle_return_time TYPE TIME USING laddle_return_time::time');
  await pool.query('ALTER TABLE laddle_return ALTER COLUMN laddle_return_time SET NOT NULL');
  await pool.query('ALTER TABLE laddle_return ALTER COLUMN poring_temperature TYPE VARCHAR(100)');
  await pool.query('ALTER TABLE laddle_return ADD COLUMN IF NOT EXISTS poring_temperature_photo TEXT');
  await pool.query('ALTER TABLE laddle_return ALTER COLUMN ccm_temperature_before_pursing TYPE VARCHAR(100)');
  await pool.query('ALTER TABLE laddle_return ADD COLUMN IF NOT EXISTS ccm_temp_before_pursing_photo TEXT');
  await pool.query('ALTER TABLE laddle_return ADD COLUMN IF NOT EXISTS ccm_temp_after_pursing_photo TEXT');
  await pool.query('ALTER TABLE laddle_return ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()');
  await pool.query('ALTER TABLE laddle_return ALTER COLUMN unique_code TYPE VARCHAR(20)');
  await pool.query('ALTER TABLE laddle_return ALTER COLUMN unique_code SET NOT NULL');
  const nullableColumns = [
    'furnace_shift_incharge',
    'furnace_crane_driver',
    'ccm_crane_driver',
    'stand1_mould_operator',
    'stand2_mould_operator',
    'shift_incharge',
    'timber_man',
    'operation_incharge',
    'laddle_return_reason'
  ];
  for (const column of nullableColumns) {
    await pool.query(`ALTER TABLE laddle_return ALTER COLUMN ${column} DROP NOT NULL`);
  }
  logger.info('Ensured laddle_return table and unique code index exist');
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
    await ensurePipeMillTable();
    await ensureReCoilerTable();
    await ensureLaddleChecklistTable();
    await ensureLaddleReturnTable();
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
