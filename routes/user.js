const express = require('express');
const userController = require('../controller/user')
const router = express.Router();
const isAuth = require('../middleware/is-auth');

router.use(userController.getStatus);
router.get('/',isAuth, userController.getHomePage);
router.get('/user',isAuth, userController.getUser);
router.get('/edit-user/:userId',isAuth, userController.getEditUser)
router.post('/edit-user',isAuth, userController.postEditUser)
router.get('/search',isAuth,userController.getStatistic);
router.get('/statistic-search-month',isAuth, userController.getSalary);
router.get('/statistic-search',isAuth, userController.getStatisticSearch);
router.get('/confirm',isAuth, userController.getConfirm);
router.get('/confirm-month',isAuth, userController.getConfirmMonth);

module.exports = router;