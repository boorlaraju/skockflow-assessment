const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/dashboardController');
router.get('/', auth, c.summary);
module.exports = router;
