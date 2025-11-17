const { StatusCodes } = require('http-status-codes');
const tundishChecklistService = require('../services/tundishChecklist.service');
const { buildResponse } = require('../utils/apiResponse');

const createEntry = async (req, res) => {
  const payload = await tundishChecklistService.createTundishChecklist(req.body);
  res.status(StatusCodes.CREATED).json(buildResponse('Tundish checklist entry recorded', payload));
};

module.exports = { createEntry };


