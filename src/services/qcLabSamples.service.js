const crypto = require('crypto');
const qcLabSamplesRepository = require('../repositories/qcLabSamples.repository');

const CODE_PREFIX = 'QC-';
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SEGMENT_LENGTH = 4;
const MAX_GENERATION_ATTEMPTS = 5;

const generateCode = () => {
  const bytes = crypto.randomBytes(SEGMENT_LENGTH);
  let segment = '';
  for (let index = 0; index < SEGMENT_LENGTH; index += 1) {
    segment += ALPHABET[bytes[index] % ALPHABET.length];
  }
  return `${CODE_PREFIX}${segment}`;
};

const createSample = async (payload) => {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const code = generateCode();
    try {
      return await qcLabSamplesRepository.insertSample({ ...payload, code });
    } catch (error) {
      if (error?.code === '23505') {
        continue;
      }
      throw error;
    }
  }

  throw new Error('Unable to generate a unique QC code after multiple attempts');
};


module.exports = { createSample };
