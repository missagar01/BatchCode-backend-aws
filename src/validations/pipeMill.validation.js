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

const optionalString = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  });

const createPipeMillSchema = {
  body: z.object({
    sample_timestamp: timestampField,
    recoiler_short_code: trimmedString('recoiler_short_code'),
    mill_number: trimmedString('mill_number'),
    section: optionalString,
    item_type: trimmedString('item_type'),
    quality_supervisor: trimmedString('quality_supervisor'),
    mill_incharge: trimmedString('mill_incharge'),
    forman_name: trimmedString('forman_name'),
    fitter_name: trimmedString('fitter_name'),
    shift: trimmedString('shift'),
    size: trimmedString('size'),
    thickness: trimmedString('thickness'),
    remarks: optionalString,
    picture: optionalString
  })
};

module.exports = { createPipeMillSchema };
