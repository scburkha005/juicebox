const express = require('express');
const router = express.Router();
const { getAllPosts } = require('../db')

router.use((req, res, next) => {
  console.log("A request is being made to /posts");

  next();
})

// GET /api/posts
router.get('/', async (req, res, next) => {
  const posts = await getAllPosts();

  res.send({
    posts
  })
})

module.exports = router;