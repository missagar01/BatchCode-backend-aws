const { Router } = require('express');
const hotCoilController = require('../controllers/hotCoil.controller');
const validateRequest = require('../middlewares/validateRequest');
const createFileUploadMiddleware = require('../middlewares/fileUpload');
const { createHotCoilSchema } = require('../validations/hotCoil.validation');

const router = Router();

const handlePictureUpload = createFileUploadMiddleware({
  fieldName: 'picture',
  subDirectory: 'hot-coil-pictures'
});

router.post('/hot-coil', handlePictureUpload, validateRequest(createHotCoilSchema), hotCoilController.createEntry);

module.exports = router;
