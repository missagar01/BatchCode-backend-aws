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

const trimmedString = (field, max = 255) => z.string().min(1, `${field} is required`).max(max).transform((value) => value.trim());
const optionalTrimmedString = (field, max = 255) =>
  z
    .string()
    .max(max, `${field} must be at most ${max} characters`)
    .optional()
    .transform((value) => {
      if (value === undefined || value === null) {
        return null;
      }
      const trimmed = value.trim();
      return trimmed.length === 0 ? null : trimmed;
    });

const createHotCoilSchema = {
  body: z
    .object({
      sample_timestamp: timestampField,
      sms_short_code: trimmedString('sms_short_code'),
      submission_type: trimmedString('submission_type'),
      size: optionalTrimmedString('size'),
      mill_incharge: optionalTrimmedString('mill_incharge'),
      quality_supervisor: optionalTrimmedString('quality_supervisor'),
      picture: optionalTrimmedString('picture', 2048),
      electrical_dc_operator: optionalTrimmedString('electrical_dc_operator'),
      remarks: optionalTrimmedString('remarks', 1000),
      strand1_temperature: optionalTrimmedString('strand1_temperature'),
      strand2_temperature: optionalTrimmedString('strand2_temperature'),
      shift_supervisor: optionalTrimmedString('shift_supervisor')
    })
    .superRefine((data, ctx) => {
      const isColdBillet = (data.submission_type ?? '').toLowerCase() === 'cold billet';
      if (isColdBillet) {
        return;
      }
      const requiredFields = [
        'size',
        'mill_incharge',
        'quality_supervisor',
        'electrical_dc_operator',
        'strand1_temperature',
        'strand2_temperature'
      ];
      requiredFields.forEach((field) => {
        if (!data[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${field} is required when submission_type is Hot Coil`
          });
        }
      });
    })
};

module.exports = { createHotCoilSchema };
