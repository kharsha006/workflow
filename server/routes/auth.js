const express = require('express');
const router = express.Router();
const { login, getMe, register, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
