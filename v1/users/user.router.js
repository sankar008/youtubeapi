const router = require('express').Router();
const { getUser, createUser, updateUser, getUserById, sendOtp, forgotPassword, userLogin, otpVerification, resetPassword } = require('./user.controller');
// const { checkToken } = require("../../author/token_validations");

router.get('/', getUser);
router.post('/', createUser);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.patch('/send-otp', sendOtp);
router.patch('/reset-password', resetPassword);
router.patch('/forgot-password', forgotPassword);
router.patch('/email-verified', otpVerification);
router.post('/login', userLogin);
module.exports = router;