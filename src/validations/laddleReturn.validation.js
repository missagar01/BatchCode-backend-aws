const { z } = require('zod');

const timestampField = z
  .preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return new Date();
    }
    if (value instanceof Date) {
      return value;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date;
  }, z.date({ invalid_type_error: 'sample_timestamp must be a valid date' }))
  .transform((value) => value.toISOString());

const parseDateInput = (value) => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return value;
  }

  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    const parsedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    return Number.isNaN(parsedDate.getTime()) ? value : parsedDate;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? value : date;
};

const dateOnlyField = z
  .preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return value;
    }
    return parseDateInput(value);
  }, z.date({ invalid_type_error: 'laddle_return_date must be a valid date' }))
  .transform((value) => value.toISOString().split('T')[0]);

const trimmedString = (field, max = 255) =>
  z
    .string()
    .min(1, `${field} is required`)
    .max(max)
    .transform((value) => value.trim());

const optionalString = z
  .string()
  .optional()
  .transform((value) => {
    if (value === undefined || value === null) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  });

const createLaddleReturnSchema = {
  body: z.object({
    sample_timestamp: timestampField,
    laddle_return_date: dateOnlyField,
    laddle_return_time: trimmedString('laddle_return_time'),
    poring_temperature: trimmedString('poring_temperature'),
    poring_temperature_photo: optionalString,
    furnace_shift_incharge: trimmedString('furnace_shift_incharge'),
    furnace_crane_driver: trimmedString('furnace_crane_driver'),
    ccm_temperature_before_pursing: trimmedString('ccm_temperature_before_pursing'),
    ccm_temp_before_pursing_photo: trimmedString('ccm_temp_before_pursing_photo'),
    ccm_temp_after_pursing_photo: trimmedString('ccm_temp_after_pursing_photo'),
    ccm_crane_driver: trimmedString('ccm_crane_driver'),
    stand1_mould_operator: trimmedString('stand1_mould_operator'),
    stand2_mould_operator: trimmedString('stand2_mould_operator'),
    shift_incharge: trimmedString('shift_incharge'),
    timber_man: trimmedString('timber_man'),
    operation_incharge: trimmedString('operation_incharge'),
    laddle_return_reason: trimmedString('laddle_return_reason')
  })
};

module.exports = { createLaddleReturnSchema };
