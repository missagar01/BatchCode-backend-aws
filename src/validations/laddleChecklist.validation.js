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
  }, z.date({ invalid_type_error: 'sample_date must be a valid date' }))
  .transform((value) => value.toISOString().split('T')[0]);

const trimmedString = (field, max = 255) =>
  z
    .string()
    .min(1, `${field} is required`)
    .max(max)
    .transform((value) => value.trim());

const createLaddleChecklistSchema = {
  body: z.object({
    sample_timestamp: timestampField,
    laddle_number: z
      .union([z.number(), z.string()])
      .refine((value) => {
        if (value === '' || value === null || value === undefined) {
          return false;
        }
        const numericValue = typeof value === 'number' ? value : Number(value);
        return Number.isInteger(numericValue);
      }, 'laddle_number must be an integer')
      .transform((value) => (typeof value === 'number' ? value : Number(value))),
    sample_date: dateOnlyField,
    slag_cleaning_top: trimmedString('slag_cleaning_top'),
    slag_cleaning_bottom: trimmedString('slag_cleaning_bottom'),
    nozzle_proper_lancing: trimmedString('nozzle_proper_lancing'),
    pursing_plug_cleaning: trimmedString('pursing_plug_cleaning'),
    sly_gate_check: trimmedString('sly_gate_check'),
    nozzle_check_cleaning: trimmedString('nozzle_check_cleaning'),
    sly_gate_operate: trimmedString('sly_gate_operate'),
    nfc_proper_heat: trimmedString('nfc_proper_heat'),
    nfc_filling_nozzle: trimmedString('nfc_filling_nozzle'),
    plate_life: z
      .union([z.number(), z.string()])
      .optional()
      .refine((value) => {
        if (value === undefined || value === null || value === '') {
          return true;
        }
        const numericValue = typeof value === 'number' ? value : Number(value);
        return Number.isInteger(numericValue);
      }, 'plate_life must be an integer')
      .transform((value) => {
        if (value === undefined || value === null || value === '') {
          return null;
        }
        return typeof value === 'number' ? value : Number(value);
      }),
    timber_man_name: trimmedString('timber_man_name'),
    laddle_man_name: trimmedString('laddle_man_name'),
    laddle_foreman_name: trimmedString('laddle_foreman_name'),
    supervisor_name: trimmedString('supervisor_name')
  })
};

module.exports = { createLaddleChecklistSchema };
