const express = require('express');
const rollcallController = require('../controller/rollcall')
const router = express.Router();
const isAuth = require('../middleware/is-auth');

router.get('/rollcall',isAuth,rollcallController.getRollcall);
router.get('/rollcall-details',isAuth,rollcallController.getRollCallDetails);
router.post('/rollcall',isAuth,rollcallController.postRollcall);

module.exports = router;