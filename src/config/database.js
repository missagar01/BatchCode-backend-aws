const { Pool } = require('pg');
const config = require('./env');
const { logger } = require('../utils/logger');

let mainPool;
let authPool;

const buildConnectionOptions = (databaseConfig) => {
  if (config.databaseUrl && databaseConfig === config.postgres) {
    return {
      connectionString: config.databaseUrl,
      ssl: config.postgres.ssl ? { rejectUnauthorized: false } : false
    };
  }

  const { host, port, user, password, database, ssl } = databaseConfig;
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
  await mainPool.query(ddl);
  await mainPool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'qc_lab_samples' AND column_name = 'code'
      ) THEN
        ALTER TABLE qc_lab_samples RENAME COLUMN code TO unique_code;
      END IF;
    END $$;
  `);
  await mainPool.query('ALTER TABLE qc_lab_samples ADD COLUMN IF NOT EXISTS unique_code VARCHAR(50)');
  await mainPool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_qc_lab_samples_unique_code ON qc_lab_samples (unique_code)');
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
      temperature VARCHAR(50),

      unique_code VARCHAR(50) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await mainPool.query(ddl);
  await mainPool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_sms_register_unique_code ON sms_register (unique_code)');
  await mainPool.query(`
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
  await mainPool.query('ALTER TABLE sms_register ADD COLUMN IF NOT EXISTS picture TEXT');
  await mainPool.query('ALTER TABLE sms_register ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()');
  await mainPool.query('ALTER TABLE sms_register ALTER COLUMN sample_timestamp SET DEFAULT CURRENT_TIMESTAMP');
  await mainPool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'sms_register' AND column_name = 'temperature'
      ) THEN
        ALTER TABLE sms_register ALTER COLUMN temperature TYPE VARCHAR(50) USING temperature::text;
      ELSE
        ALTER TABLE sms_register ADD COLUMN temperature VARCHAR(50);
      END IF;
    END $$;
  `);
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
  await mainPool.query(ddl);
  await mainPool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_hot_coil_unique_code ON hot_coil (unique_code)');
  await mainPool.query('ALTER TABLE hot_coil ADD COLUMN IF NOT EXISTS submission_type TEXT');
  await mainPool.query('ALTER TABLE hot_coil ADD COLUMN IF NOT EXISTS picture TEXT');
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
  await mainPool.query(ddl);
  await mainPool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_pipe_mill_unique_code ON pipe_mill (unique_code)');
  await mainPool.query('ALTER TABLE pipe_mill ALTER COLUMN sample_timestamp SET DEFAULT CURRENT_TIMESTAMP');
  await mainPool.query('ALTER TABLE pipe_mill ADD COLUMN IF NOT EXISTS section VARCHAR(50)');
  await mainPool.query('ALTER TABLE pipe_mill ADD COLUMN IF NOT EXISTS item_type VARCHAR(50)');
  await mainPool.query('ALTER TABLE pipe_mill ADD COLUMN IF NOT EXISTS thickness VARCHAR(30)');
  await mainPool.query('ALTER TABLE pipe_mill ADD COLUMN IF NOT EXISTS picture TEXT');
  await mainPool.query('ALTER TABLE pipe_mill ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()');
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
  await mainPool.query(ddl);
  await mainPool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_re_coiler_unique_code ON re_coiler (unique_code)');
  await mainPool.query('ALTER TABLE re_coiler ALTER COLUMN sample_timestamp SET DEFAULT CURRENT_TIMESTAMP');
  await mainPool.query('ALTER TABLE re_coiler ADD COLUMN IF NOT EXISTS size VARCHAR(50)');
  await mainPool.query('ALTER TABLE re_coiler ADD COLUMN IF NOT EXISTS supervisor VARCHAR(100)');
  await mainPool.query('ALTER TABLE re_coiler ADD COLUMN IF NOT EXISTS incharge VARCHAR(100)');
  await mainPool.query('ALTER TABLE re_coiler ADD COLUMN IF NOT EXISTS contractor VARCHAR(100)');
  await mainPool.query('ALTER TABLE re_coiler ADD COLUMN IF NOT EXISTS machine_number VARCHAR(50)');
  await mainPool.query('ALTER TABLE re_coiler ADD COLUMN IF NOT EXISTS welder_name VARCHAR(100)');
  await mainPool.query('ALTER TABLE re_coiler ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()');
  await mainPool.query('ALTER TABLE re_coiler ALTER COLUMN unique_code SET NOT NULL');
  logger.info('Ensured re_coiler table and unique code index exist');
};

const ensureTundishChecklistTable = async () => {
  const ddl = `
    CREATE TABLE IF NOT EXISTS tundish_checklist (
      id SERIAL PRIMARY KEY,

      sample_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      tundish_number INTEGER,

      nozzle_plate_check TEXT,
      well_block_check TEXT,
      board_proper_set TEXT,
      board_sand_filling TEXT,
      refractory_slag_cleaning TEXT,
      tundish_mession_name TEXT,
      handover_proper_check TEXT,
      handover_nozzle_installed TEXT,
      handover_masala_inserted TEXT,
      stand1_mould_operator TEXT,
      stand2_mould_operator TEXT,
      timber_man_name TEXT,
      laddle_operator_name TEXT,
      shift_incharge_name TEXT,
      forman_name TEXT,
      unique_code TEXT
    )
  `;
  await mainPool.query(ddl);
  await mainPool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_tundish_checklist_unique_code ON tundish_checklist (unique_code)');
  await mainPool.query('ALTER TABLE tundish_checklist ALTER COLUMN sample_timestamp SET DEFAULT CURRENT_TIMESTAMP');
  await mainPool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tundish_checklist' AND column_name = 'sample_date'
      ) THEN
        ALTER TABLE tundish_checklist DROP COLUMN sample_date;
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tundish_checklist' AND column_name = 'sample_time'
      ) THEN
        ALTER TABLE tundish_checklist DROP COLUMN sample_time;
      END IF;
    END $$;
  `);

  await mainPool.query('ALTER TABLE tundish_checklist ALTER COLUMN unique_code SET NOT NULL');
  logger.info('Ensured tundish_checklist table and unique code index exist');
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
  await mainPool.query(ddl);
  await mainPool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_laddle_checklist_unique_code ON laddle_checklist (unique_code)');
  await mainPool.query('ALTER TABLE laddle_checklist ALTER COLUMN sample_timestamp SET DEFAULT CURRENT_TIMESTAMP');
  await mainPool.query('ALTER TABLE laddle_checklist ALTER COLUMN sample_date TYPE DATE USING sample_date::date');
  await mainPool.query('ALTER TABLE laddle_checklist ALTER COLUMN sample_date SET NOT NULL');
  await mainPool.query('ALTER TABLE laddle_checklist ALTER COLUMN laddle_number TYPE INTEGER USING laddle_number::integer');
  await mainPool.query('ALTER TABLE laddle_checklist ALTER COLUMN laddle_number SET NOT NULL');
  await mainPool.query('ALTER TABLE laddle_checklist ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()');
  await mainPool.query('ALTER TABLE laddle_checklist ALTER COLUMN unique_code SET NOT NULL');
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
  await mainPool.query(ddl);
  await mainPool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_laddle_return_unique_code ON laddle_return (unique_code)');
  await mainPool.query('ALTER TABLE laddle_return ALTER COLUMN sample_timestamp SET DEFAULT CURRENT_TIMESTAMP');
  await mainPool.query('ALTER TABLE laddle_return ALTER COLUMN laddle_return_date TYPE DATE USING laddle_return_date::date');
  await mainPool.query('ALTER TABLE laddle_return ALTER COLUMN laddle_return_date SET NOT NULL');
  await mainPool.query('ALTER TABLE laddle_return ALTER COLUMN laddle_return_time TYPE TIME USING laddle_return_time::time');
  await mainPool.query('ALTER TABLE laddle_return ALTER COLUMN laddle_return_time SET NOT NULL');
  await mainPool.query('ALTER TABLE laddle_return ALTER COLUMN poring_temperature TYPE VARCHAR(100)');
  await mainPool.query('ALTER TABLE laddle_return ADD COLUMN IF NOT EXISTS poring_temperature_photo TEXT');
  await mainPool.query('ALTER TABLE laddle_return ALTER COLUMN ccm_temperature_before_pursing TYPE VARCHAR(100)');
  await mainPool.query('ALTER TABLE laddle_return ADD COLUMN IF NOT EXISTS ccm_temp_before_pursing_photo TEXT');
  await mainPool.query('ALTER TABLE laddle_return ADD COLUMN IF NOT EXISTS ccm_temp_after_pursing_photo TEXT');
  await mainPool.query('ALTER TABLE laddle_return ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()');
  await mainPool.query('ALTER TABLE laddle_return ALTER COLUMN unique_code TYPE VARCHAR(20)');
  await mainPool.query('ALTER TABLE laddle_return ALTER COLUMN unique_code SET NOT NULL');
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
    await mainPool.query(`ALTER TABLE laddle_return ALTER COLUMN ${column} DROP NOT NULL`);
  }
  logger.info('Ensured laddle_return table and unique code index exist');
};

const ensureAuthUsersTable = async () => {
  if (!authPool) {
    return;
  }
  const ddl = `
    CREATE TABLE IF NOT EXISTS public.users (
      id SERIAL PRIMARY KEY,
      user_name VARCHAR(150) UNIQUE,
      username VARCHAR(150),
      employee_id VARCHAR(150) UNIQUE,
      password TEXT,
      password_hash TEXT,
      role VARCHAR(50) DEFAULT 'user',
      user_status VARCHAR(50) DEFAULT 'active',
      email_id VARCHAR(200),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await authPool.query(ddl);
  await authPool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_user_name ON public.users (user_name)');
  await authPool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_employee_id ON public.users (employee_id)');
  logger.info('Ensured auth users table exists');
};

const connectDatabase = async () => {
  if (mainPool) {
    return mainPool;
  }

  const options = buildConnectionOptions(config.postgres);
  if (!options) {
    logger.warn('Database configuration missing. Skipping main database connection.');
    return null;
  }

  try {
    mainPool = new Pool(options);
    mainPool.on('error', (error) => {
      logger.error('Unexpected PostgreSQL client error', error);
    });

    await mainPool.query('SELECT 1');
    logger.info('Main database connection established');

    await ensureQcLabSamplesTable();
    await ensureSmsRegisterTable();
    await ensureHotCoilTable();
    await ensurePipeMillTable();
    await ensureReCoilerTable();
    await ensureTundishChecklistTable();
    await ensureLaddleChecklistTable();
    await ensureLaddleReturnTable();
    return mainPool;
  } catch (error) {
    logger.error('Database connection failed', error);
    throw error;
  }
};

const connectAuthDatabase = async () => {
  if (authPool) {
    return authPool;
  }

  const options = buildConnectionOptions(config.authDatabase);
  if (!options) {
    logger.warn('Auth database configuration missing. Skipping auth database connection.');
    return null;
  }

  try {
    authPool = new Pool(options);
    authPool.on('error', (error) => {
      logger.error('Unexpected PostgreSQL auth client error', error);
    });

    await authPool.query('SELECT 1');
    logger.info('Auth database connection established');
    await ensureAuthUsersTable();
    return authPool;
  } catch (error) {
    logger.error('Auth database connection failed', error);
    throw error;
  }
};

const getPool = () => {
  if (!mainPool) {
    throw new Error('Database has not been initialized. Call connectDatabase() first.');
  }
  return mainPool;
};

const getAuthPool = () => {
  if (!authPool) {
    throw new Error('Auth database has not been initialized. Call connectAuthDatabase() first.');
  }
  return authPool;
};

module.exports = { connectDatabase, getPool, connectAuthDatabase, getAuthPool };
