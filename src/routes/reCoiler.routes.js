const { Router } = require('express');
const reCoilerController = require('../controllers/reCoiler.controller');
const validateRequest = require('../middlewares/validateRequest');
const { createReCoilerSchema } = require('../validations/reCoiler.validation');

const router = Router();

router
  .route('/re-coiler')
  .post(validateRequest(createReCoilerSchema), reCoilerController.createEntry)
  .get(reCoilerController.listEntries);

router.get('/re-coiler/:unique_code', reCoilerController.getEntryByUniqueCode);

module.exports = router;
