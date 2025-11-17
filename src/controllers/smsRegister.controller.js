const { StatusCodes } = require('http-status-codes');
const smsRegisterService = require('../services/smsRegister.service');
const { buildResponse } = require('../utils/apiResponse');

const createEntry = async (req, res) => {
  const payload = await smsRegisterService.createSmsRegister(req.body);
  res.status(StatusCodes.CREATED).json(buildResponse('SMS register entry recorded', payload));
};

module.exports = { createEntry };
