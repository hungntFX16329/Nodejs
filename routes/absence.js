const express = require('express');
const absenceController = require('../controller/absence')
const router = express.Router();
const isAuth = require('../middleware/is-auth');

router.get('/absence',isAuth,absenceController.getAbsence);
router.post('/absence',isAuth,absenceController.postAbsence);

module.exports = router;