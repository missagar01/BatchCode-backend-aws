const { getPool } = require('../config/database');

const insertHotCoil = async (payload) => {
  const {
    sample_timestamp,
    sms_short_code,
    size,
    mill_incharge,
    quality_supervisor,
    electrical_dc_operator,
    remarks = null,
    strand1_temperature,
    strand2_temperature,
    shift_supervisor,
    unique_code
  } = payload;

  const query = `
    INSERT INTO hot_coil (
      sample_timestamp,
      sms_short_code,
      size,
      mill_incharge,
      quality_supervisor,
      electrical_dc_operator,
      remarks,
      strand1_temperature,
      strand2_temperature,
      shift_supervisor,
      unique_code
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;

  const values = [
    sample_timestamp ?? null,
    sms_short_code,
    size,
    mill_incharge,
    quality_supervisor,
    electrical_dc_operator,
    remarks,
    strand1_temperature,
    strand2_temperature,
    shift_supervisor,
    unique_code
  ];

  const { rows } = await getPool().query(query, values);
  return rows[0];
};

module.exports = { insertHotCoil };
