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

const trimmedString = (field, max = 255) =>
  z
    .string()
    .min(1, `${field} is required`)
    .max(max)
    .transform((value) => value.trim());

const createReCoilerSchema = {
  body: z.object({
    sample_timestamp: timestampField,
    hot_coiler_short_code: trimmedString('hot_coiler_short_code'),
    size: trimmedString('size'),
    supervisor: trimmedString('supervisor'),
    incharge: trimmedString('incharge'),
    contractor: trimmedString('contractor'),
    machine_number: trimmedString('machine_number'),
    welder_name: trimmedString('welder_name')
  })
};

module.exports = { createReCoilerSchema };
