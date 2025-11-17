const { Router } = require('express');
const reCoilerController = require('../controllers/reCoiler.controller');
const validateRequest = require('../middlewares/validateRequest');
const { createReCoilerSchema } = require('../validations/reCoiler.validation');

const router = Router();

router.post('/re-coiler', validateRequest(createReCoilerSchema), reCoilerController.createEntry);

module.exports = router;
