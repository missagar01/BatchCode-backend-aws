const { Router } = require('express');
const laddleChecklistController = require('../controllers/laddleChecklist.controller');
const validateRequest = require('../middlewares/validateRequest');
const { createLaddleChecklistSchema } = require('../validations/laddleChecklist.validation');

const router = Router();

router
  .route('/laddle-checklist')
  .post(validateRequest(createLaddleChecklistSchema), laddleChecklistController.createEntry)
  .get(laddleChecklistController.listEntries);

router.get('/laddle-checklist/:unique_code', laddleChecklistController.getEntryByUniqueCode);

module.exports = router;
