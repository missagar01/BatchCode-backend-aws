const { StatusCodes } = require('http-status-codes');
const authService = require('../services/auth.service');
const { buildResponse } = require('../utils/apiResponse');
const tokenBlacklist = require('../utils/tokenBlacklist');

const login = async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.status(StatusCodes.OK).json(buildResponse('Login successful', { user, token }));
};

const logout = async (req, res) => {
  // requireAuth adds req.token and req.user
  const token = req.token;
  const exp = req.user?.exp;
  tokenBlacklist.blacklistToken(token, exp);
  res.status(StatusCodes.OK).json(buildResponse('Logout successful'));
};

module.exports = { login, logout };
