const express = require('express');
const router = express.Router();
const authController = require('../Controllers/auth.controller')

router.put('/signup',authController.signUp)
router.post('/login',authController.login)
router.post('/resetpassword',authController.resetPassword)
router.get('/changepassword/:token',authController.changePassword)
router.post('/newpassword',authController.newPassword)






module.exports = router;