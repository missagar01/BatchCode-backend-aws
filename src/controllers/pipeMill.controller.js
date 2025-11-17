const { StatusCodes } = require('http-status-codes');
const pipeMillService = require('../services/pipeMill.service');
const { buildResponse } = require('../utils/apiResponse');

const createEntry = async (req, res) => {
  const payload = await pipeMillService.createPipeMill(req.body);
  res.status(StatusCodes.CREATED).json(buildResponse('Pipe Mill entry recorded', payload));
};

module.exports = { createEntry };
