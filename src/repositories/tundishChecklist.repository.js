const { getPool } = require('../config/database');

const insertTundishChecklist = async (payload) => {
  const {
    sample_timestamp,
    tundish_number,
    sample_date,
    sample_time,
    nozzle_plate_check,
    well_block_check,
    board_proper_set,
    board_sand_filling,
    refractory_slag_cleaning,
    tundish_mession_name,
    handover_proper_check,
    handover_nozzle_installed,
    handover_masala_inserted,
    stand1_mould_operator,
    stand2_mould_operator,
    timber_man_name,
    laddle_operator_name,
    shift_incharge_name,
    forman_name,
    unique_code
  } = payload;

  const query = `
    INSERT INTO tundish_checklist (
      sample_timestamp,
      tundish_number,
      sample_date,
      sample_time,
      nozzle_plate_check,
      well_block_check,
      board_proper_set,
      board_sand_filling,
      refractory_slag_cleaning,
      tundish_mession_name,
      handover_proper_check,
      handover_nozzle_installed,
      handover_masala_inserted,
      stand1_mould_operator,
      stand2_mould_operator,
      timber_man_name,
      laddle_operator_name,
      shift_incharge_name,
      forman_name,
      unique_code
    )
    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20
    )
    RETURNING *
  `;

  const values = [
    sample_timestamp ?? null,
    tundish_number ?? null,
    sample_date ?? null,
    sample_time,
    nozzle_plate_check,
    well_block_check,
    board_proper_set,
    board_sand_filling,
    refractory_slag_cleaning,
    tundish_mession_name,
    handover_proper_check,
    handover_nozzle_installed,
    handover_masala_inserted,
    stand1_mould_operator,
    stand2_mould_operator,
    timber_man_name,
    laddle_operator_name,
    shift_incharge_name,
    forman_name,
    unique_code
  ];

  const { rows } = await getPool().query(query, values);
  return rows[0];
};

module.exports = { insertTundishChecklist };
