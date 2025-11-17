const { getPool } = require('../config/database');

const insertSample = async (payload) => {
  const {
    sms_batch_code,
    sampled_furnace_number,
    sampled_sequence,
    sampled_laddle_number,
    shift,
    final_c,
    final_mn,
    final_s,
    final_p,
    sample_tested_by,
    remarks = null,
    test_report_picture = null,
    code
  } = payload;

  const query = `
    INSERT INTO qc_lab_samples (
      sms_batch_code,
      sampled_furnace_number,
      sampled_sequence,
      sampled_laddle_number,
      shift,
      final_c,
      final_mn,
      final_s,
      final_p,
      sample_tested_by,
      remarks,
      test_report_picture,
      code
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13
    )
    RETURNING *
  `;

  const values = [
    sms_batch_code,
    sampled_furnace_number,
    sampled_sequence,
    sampled_laddle_number,
    shift,
    final_c ?? null,
    final_mn ?? null,
    final_s ?? null,
    final_p ?? null,
    sample_tested_by,
    remarks,
    test_report_picture,
    code
  ];

  const { rows } = await getPool().query(query, values);
  return rows[0];
};

module.exports = { insertSample };
