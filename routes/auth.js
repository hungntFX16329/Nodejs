const express = require('express');
const { check } = require('express-validator/check');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

router.post(
    '/signup'
    ,check('email')
    .isEmail()
    .withMessage('Please enter a valid email !')
    ,authController.postSignup);

router.post('/logout', authController.postLogout);

module.exports = router;