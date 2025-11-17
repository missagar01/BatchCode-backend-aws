const { StatusCodes } = require('http-status-codes');
const reCoilerService = require('../services/reCoiler.service');
const { buildResponse } = require('../utils/apiResponse');

const createEntry = async (req, res) => {
  const payload = await reCoilerService.createReCoiler(req.body);
  res.status(StatusCodes.CREATED).json(buildResponse('Re-Coiler entry recorded', payload));
};

module.exports = { createEntry };
