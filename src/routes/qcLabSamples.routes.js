const { Router } = require('express');
const qcLabSamplesController = require('../controllers/qcLabSamples.controller');
const validateRequest = require('../middlewares/validateRequest');
const createFileUploadMiddleware = require('../middlewares/fileUpload');
const { createSampleSchema } = require('../validations/qcLabSamples.validation');

const router = Router();

const handleTestReportUpload = createFileUploadMiddleware({
  fieldName: 'test_report_picture',
  subDirectory: 'qc-test-report-pictures'
});

router.post(
  '/qc-lab-samples',
  handleTestReportUpload,
  validateRequest(createSampleSchema),
  qcLabSamplesController.createSample
);

module.exports = router;
