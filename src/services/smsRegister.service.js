const crypto = require('crypto');
const smsRegisterRepository = require('../repositories/smsRegister.repository');

const CODE_PREFIX = 'S-';
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

const createSmsRegister = async (payload) => {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const unique_code = generateUniqueCode();
    try {
      return await smsRegisterRepository.insertSmsRegister({ ...payload, unique_code });
    } catch (error) {
      if (error?.code === '23505') {
        continue;
      }
      throw error;
    }
  }

  throw new Error('Unable to generate a unique SMS register code after multiple attempts');
};

const listSmsRegisters = async (filters = {}) => smsRegisterRepository.findSmsRegisters(filters);

module.exports = { createSmsRegister, listSmsRegisters };
