const { StatusCodes } = require('http-status-codes');
const authService = require('../services/auth.service');
const { buildResponse } = require('../utils/apiResponse');

const login = async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.status(StatusCodes.OK).json(buildResponse('Login successful', { user, token }));
};

module.exports = { login };
