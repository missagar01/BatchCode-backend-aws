const { StatusCodes } = require('http-status-codes');
const laddleChecklistService = require('../services/laddleChecklist.service');
const { buildResponse } = require('../utils/apiResponse');

const createEntry = async (req, res) => {
  const payload = await laddleChecklistService.createLaddleChecklist(req.body);
  res.status(StatusCodes.CREATED).json(buildResponse('Laddle checklist entry recorded', payload));
};

module.exports = { createEntry };
