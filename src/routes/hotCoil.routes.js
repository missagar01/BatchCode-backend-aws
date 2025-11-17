const { Router } = require('express');
const hotCoilController = require('../controllers/hotCoil.controller');
const validateRequest = require('../middlewares/validateRequest');
const { createHotCoilSchema } = require('../validations/hotCoil.validation');

const router = Router();

router.post('/hot-coil', validateRequest(createHotCoilSchema), hotCoilController.createEntry);

module.exports = router;
