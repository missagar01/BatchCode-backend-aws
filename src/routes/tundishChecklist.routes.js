const { Router } = require('express');
const tundishChecklistController = require('../controllers/tundishChecklist.controller');
const validateRequest = require('../middlewares/validateRequest');
const { createTundishChecklistSchema } = require('../validations/tundishChecklist.validation');

const router = Router();

router
  .route('/tundish-checklist')
  .post(validateRequest(createTundishChecklistSchema), tundishChecklistController.createEntry)
  .get(tundishChecklistController.listEntries);

router.get('/tundish-checklist/:unique_code', tundishChecklistController.getEntryByUniqueCode);

module.exports = router;
