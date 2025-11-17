const { getPool } = require('../config/database');

const insertSmsRegister = async (payload) => {
  const {
    sample_timestamp,
    sequence_number,
    laddle_number,
    sms_head,
    furnace_number,
    remarks = null,
    shift_incharge,
    temprature,
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
      shift_incharge,
      temprature,
      unique_code
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const values = [
    sample_timestamp ?? null,
    sequence_number,
    laddle_number ?? null,
    sms_head,
    furnace_number,
    remarks,
    shift_incharge,
    temprature ?? null,
    unique_code
  ];

  const { rows } = await getPool().query(query, values);
  return rows[0];
};

module.exports = { insertSmsRegister };
