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

const optionalStringField = (field, max = 255) =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => {
      if (value === undefined || value === null) {
        return null;
      }
      const trimmed = value.trim();
      return trimmed.length === 0 ? null : trimmed;
    })
    .refine((value) => value === null || value.length <= max, `${field} must be at most ${max} characters`);

const createReCoilerSchema = {
  body: z.object({
    sample_timestamp: timestampField,
    hot_coiler_short_code: trimmedString('hot_coiler_short_code', 50),
    size: optionalStringField('size', 50),
    supervisor: optionalStringField('supervisor', 100),
    incharge: optionalStringField('incharge', 100),
    contractor: optionalStringField('contractor', 100),
    machine_number: optionalStringField('machine_number', 50),
    welder_name: optionalStringField('welder_name', 100)
  })
};

module.exports = { createReCoilerSchema };
