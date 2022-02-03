const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../db')

router.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
})

// GET /api/users
router.get('/', async (req, res, next) => {
  const users = await getAllUsers();

  res.send({
    users
  })
})

// POST api/users/login
router.post('/login', async (req, res, next) => {
  console.log(req.body)
  res.end();
})
module.exports = router;