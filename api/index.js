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
  const auth = req.header('Authorization')

  if (!auth) {
    next();
  }
  else if (auth.startsWith(prefix)) {
    // auth = 'Bearer tpoisdj.pdsoifj.asdpoifap'
    // [Bearer, tpoisdj.pdsoifj.asdpoifap]
    const [ , token] = auth.split(' ');
    try {
      const { id } = jwt.verify(token, JWT_SECRET)

      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${prefix}`
    });
  }
});

router.use((req, res, next) => {
  if (req.user) {
    console.log("User is set:", req.user);
  }

  next();
})

// PATH /api/users
router.use('/users', require('./users'));
router.use('/posts', require('./posts'));
router.use('/tags', require('./tags'));


module.exports = router;