const { Router } = require('express');
const laddleReturnController = require('../controllers/laddleReturn.controller');
const validateRequest = require('../middlewares/validateRequest');
const createFileUploadMiddleware = require('../middlewares/fileUpload');
const { createLaddleReturnSchema } = require('../validations/laddleReturn.validation');

const router = Router();

const handleUploads = createFileUploadMiddleware({
  fields: [
    { fieldName: 'poring_temperature_photo', subDirectory: 'laddle-return-poring-temperature' },
    { fieldName: 'ccm_temp_before_pursing_photo', subDirectory: 'laddle-return-ccm-before' },
    { fieldName: 'ccm_temp_after_pursing_photo', subDirectory: 'laddle-return-ccm-after' }
  ]
});

router.post(
  '/laddle-return',
  handleUploads,
  validateRequest(createLaddleReturnSchema),
  laddleReturnController.createEntry
);

module.exports = router;
