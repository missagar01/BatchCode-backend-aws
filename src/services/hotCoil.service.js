const crypto = require('crypto');
const hotCoilRepository = require('../repositories/hotCoil.repository');

const CODE_PREFIX = 'H-';
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const SEGMENT_LENGTH = 4;
const MAX_GENERATION_ATTEMPTS = 7;

const generateUniqueCode = () => {
  const bytes = crypto.randomBytes(SEGMENT_LENGTH);
  let segment = '';
  for (let index = 0; index < SEGMENT_LENGTH; index += 1) {
    segment += ALPHABET[bytes[index] % ALPHABET.length];
  }
  return `${CODE_PREFIX}${segment}`;
};

const createHotCoil = async (payload) => {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const unique_code = generateUniqueCode();
    try {
      return await hotCoilRepository.insertHotCoil({ ...payload, unique_code });
    } catch (error) {
      if (error?.code === '23505') {
        continue;
      }
      throw error;
    }
  }

  throw new Error('Unable to generate a unique Hot Coil code after multiple attempts');
};

const listHotCoilEntries = async (filters = {}) => hotCoilRepository.findHotCoilEntries(filters);

const getHotCoilByUniqueCode = async (uniqueCode) => {
  const [entry] = await hotCoilRepository.findHotCoilEntries({ uniqueCode });
  return entry ?? null;
};

module.exports = { createHotCoil, listHotCoilEntries, getHotCoilByUniqueCode };
