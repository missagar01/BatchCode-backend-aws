const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const authRepository = require('../repositories/auth.repository');
const config = require('../config/env');
const ApiError = require('../utils/apiError');

const buildToken = (user) => {
  const role = user.role || 'user';
  const payload = {
    sub: user.id,
    id: user.id,
    username: user.username,
    employee_id: user.employee_id,
    role,
    created_at: user.created_at
  };
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

const login = async ({ user_name, employee_id, password, username }) => {
  const lookupName = user_name ?? username;
  const user = await authRepository.findByLogin({ userName: lookupName, employeeId: employee_id });
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  // Support hashed (in password_hash or password) and plain-text (password) storage.
  const hashToCheck = user.password_hash ?? user.password;
  const bcryptMatch = hashToCheck
    ? await bcrypt.compare(password, hashToCheck).catch(() => false)
    : false;
  const plainMatch = user.password ? user.password === password : false;

  if (!bcryptMatch && !plainMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  const createdAtIso = user.created_at ? new Date(user.created_at).toISOString() : null;

  const safeUser = {
    id: user.id,
    username: user.user_name ?? user.username,
    employee_id: user.employee_id,
    role: user.role || 'user',
    created_at: createdAtIso
  };
  const token = buildToken(safeUser);
  return { user: safeUser, token };
};

module.exports = { login };
