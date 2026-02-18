const express = require('express');
const { register, login, logout, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);

module.exports = router;
