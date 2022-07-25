const express = require('express');
const covidController = require('../controller/covid')
const router = express.Router();
const isAuth = require('../middleware/is-auth');

router.get('/covid',isAuth,covidController.getCovidInfor);
router.get('/covid-details',isAuth,covidController.getCovidDetails);
router.post('/covid',isAuth,covidController.postCovid);
router.get('/covid-details/:userId', isAuth, covidController.getDownloadInfo)

module.exports = router;