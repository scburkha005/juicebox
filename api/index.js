const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');

const { JWT_SECRET } = process.env;
//Maybe error handle better? => app.use() w next function to handle errors

// POST /api/users/login
//Authorization
router.use(async (req, res, next) => {
  const prefix = 'Bearer '
  const auth = req.headers['authorization'];

  if (!auth) {
    next();
  }
  else if (auth.startsWith(prefix)) {
    // auth = 'Bearer tpoisdj.pdsoifj.asdpoifap'
    // [Bearer, tpoisdj.pdsoifj.asdpoifap]
    const [ , token] = auth.split(' ');
    try {
      const { id } = jwt.verify(token, JWT_SECRET)

      const user = await getUserById(id);
      console.log(user)

      req.user = user;

      next();
    } catch(err) {
      throw err;
    }
  }
})

// PATH /api/users
router.use('/users', require('./users'));
router.use('/posts', require('./posts'));
router.use('/tags', require('./tags'));


module.exports = router;