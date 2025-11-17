const { StatusCodes } = require('http-status-codes');
const hotCoilService = require('../services/hotCoil.service');
const { buildResponse } = require('../utils/apiResponse');

const createEntry = async (req, res) => {
  const payload = await hotCoilService.createHotCoil(req.body);
  res.status(StatusCodes.CREATED).json(buildResponse('Hot coil entry recorded', payload));
};

module.exports = { createEntry };
