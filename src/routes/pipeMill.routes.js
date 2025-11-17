const { Router } = require('express');
const pipeMillController = require('../controllers/pipeMill.controller');
const validateRequest = require('../middlewares/validateRequest');
const createFileUploadMiddleware = require('../middlewares/fileUpload');
const { createPipeMillSchema } = require('../validations/pipeMill.validation');

const router = Router();

const handlePictureUpload = createFileUploadMiddleware({
  fieldName: 'picture',
  subDirectory: 'pipe-mill-pictures'
});

router.post('/pipe-mill', handlePictureUpload, validateRequest(createPipeMillSchema), pipeMillController.createEntry);

module.exports = router;
