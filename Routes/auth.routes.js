const express = require('express');
const router = express.Router();
const authController = require('../Controllers/auth.controller')

router.put('/signup',authController.signUp)
router.post('/login',authController.login)




module.exports = router;