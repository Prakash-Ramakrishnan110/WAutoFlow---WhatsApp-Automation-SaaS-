const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { signupValidator, loginValidator } = require('../utils/validators');
const authenticate = require('../middleware/auth');

router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);
router.get('/me', authenticate, getMe);

module.exports = router;

