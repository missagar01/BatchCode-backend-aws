const { Router } = require('express');
const laddleChecklistController = require('../controllers/laddleChecklist.controller');
const validateRequest = require('../middlewares/validateRequest');
const { createLaddleChecklistSchema } = require('../validations/laddleChecklist.validation');

const router = Router();

router.post(
  '/laddle-checklist',
  validateRequest(createLaddleChecklistSchema),
  laddleChecklistController.createEntry
);

module.exports = router;
