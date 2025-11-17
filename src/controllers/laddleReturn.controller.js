const { StatusCodes } = require('http-status-codes');
const laddleReturnService = require('../services/laddleReturn.service');
const { buildResponse } = require('../utils/apiResponse');

const createEntry = async (req, res) => {
  const payload = await laddleReturnService.createLaddleReturn(req.body);
  res.status(StatusCodes.CREATED).json(buildResponse('Laddle return entry recorded', payload));
};

module.exports = { createEntry };
