const { Router } = require('express');
const smsRegisterController = require('../controllers/smsRegister.controller');
const validateRequest = require('../middlewares/validateRequest');
const { createSmsRegisterSchema } = require('../validations/smsRegister.validation');

const router = Router();

router.post('/sms-register', validateRequest(createSmsRegisterSchema), smsRegisterController.createEntry);

module.exports = router;
