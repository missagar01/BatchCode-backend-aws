const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const validateRequest = require('../middlewares/validateRequest');
const { loginSchema } = require('../validations/auth.validation');
const { requireAuth } = require('../middlewares/auth');

const router = Router();

router.post('/auth/login', validateRequest(loginSchema), authController.login);
router.post('/auth/logout', requireAuth, authController.logout);

module.exports = router;
