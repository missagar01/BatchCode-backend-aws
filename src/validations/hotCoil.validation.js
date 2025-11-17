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

const optionalString = z
  .string()
  .optional()
  .transform((value) => {
    if (value === undefined) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  });

const nullableString = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  });

const trimmedString = (field, max = 255) => z.string().min(1, `${field} is required`).max(max).transform((value) => value.trim());

const createHotCoilSchema = {
  body: z.object({
    sample_timestamp: timestampField,
    sms_short_code: trimmedString('sms_short_code'),
    size: trimmedString('size'),
    mill_incharge: trimmedString('mill_incharge'),
    quality_supervisor: trimmedString('quality_supervisor'),
    electrical_dc_operator: trimmedString('electrical_dc_operator'),
    remarks: optionalString,
    strand1_temperature: trimmedString('strand1_temperature'),
    strand2_temperature: trimmedString('strand2_temperature'),
    shift_supervisor: nullableString
  })
};

module.exports = { createHotCoilSchema };
