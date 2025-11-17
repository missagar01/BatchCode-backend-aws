const { Router } = require('express');
const tundishChecklistController = require('../controllers/tundishChecklist.controller');
const validateRequest = require('../middlewares/validateRequest');
const { createTundishChecklistSchema } = require('../validations/tundishChecklist.validation');

const router = Router();

router.post(
  '/tundish-checklist',
  validateRequest(createTundishChecklistSchema),
  tundishChecklistController.createEntry
);

module.exports = router;
