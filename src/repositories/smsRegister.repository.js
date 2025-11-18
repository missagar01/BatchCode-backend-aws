const { getPool } = require('../config/database');

const insertSmsRegister = async (payload) => {
  const {
    sample_timestamp,
    sequence_number,
    laddle_number,
    sms_head,
    furnace_number,
    remarks = null,
    picture = null,
    shift_incharge,
    temperature,
    unique_code
  } = payload;

  const query = `
    INSERT INTO sms_register (
      sample_timestamp,
      sequence_number,
      laddle_number,
      sms_head,
      furnace_number,
      remarks,
      picture,
      shift_incharge,
      temperature,
      unique_code
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const values = [
    sample_timestamp ?? null,
    sequence_number,
    laddle_number ?? null,
    sms_head,
    furnace_number,
    remarks,
    picture,
    shift_incharge,
    temperature ?? null,
    unique_code
  ];

  const { rows } = await getPool().query(query, values);
  return rows[0];
};

const findSmsRegisters = async ({ id, uniqueCode } = {}) => {
  const filters = [];
  const values = [];

  if (typeof id === 'number') {
    values.push(id);
    filters.push(`id = $${values.length}`);
  }

  if (typeof uniqueCode === 'string') {
    values.push(uniqueCode);
    filters.push(`unique_code = $${values.length}`);
  }

  let query = `
    SELECT *
    FROM sms_register
  `;

  if (filters.length > 0) {
    query += ` WHERE ${filters.join(' OR ')}`;
  }

  query += ' ORDER BY sample_timestamp DESC NULLS LAST, id DESC';

  const { rows } = await getPool().query(query, values);
  return rows;
};

module.exports = { insertSmsRegister, findSmsRegisters };
