const { z } = require('zod');

const decimalField = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .refine((value) => {
    if (value === undefined || value === null || value === '') {
      return true;
    }
    const numericValue = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numericValue);
  }, 'Value must be numeric')
  .transform((value) => {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    return typeof value === 'number' ? value : Number(value);
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

const createSampleSchema = {
  body: z.object({
    sms_batch_code: z.string().min(1, 'sms_batch_code is required').max(255),
    sampled_furnace_number: z.string().min(1, 'sampled_furnace_number is required').max(255),
    sampled_sequence: z.string().min(1, 'sampled_sequence is required').max(255),
    sampled_laddle_number: z.string().min(1, 'sampled_laddle_number is required').max(255),
    shift: z.string().min(1, 'shift is required').max(50),
    final_c: decimalField,
    final_mn: decimalField,
    final_s: decimalField,
    final_p: decimalField,
    sample_tested_by: z.string().min(1, 'sample_tested_by is required').max(255),
    remarks: nullableString,
    test_report_picture: nullableString
  })
};

module.exports = { createSampleSchema };
