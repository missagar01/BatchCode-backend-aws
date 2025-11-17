const { StatusCodes } = require('http-status-codes');
const qcLabSamplesService = require('../services/qcLabSamples.service');
const { buildResponse } = require('../utils/apiResponse');

const createSample = async (req, res) => {
  const payload = await qcLabSamplesService.createSample(req.body);
  res.status(StatusCodes.CREATED).json(buildResponse('QC lab sample recorded', payload));
};

module.exports = { createSample };
