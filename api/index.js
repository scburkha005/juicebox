const express = require('express');
const router = express.Router();

// PATH /api/users
router.use('/users', require('./users'));
router.use('/posts', require('./posts'));
router.use('/tags', require('./tags'));


module.exports = router;