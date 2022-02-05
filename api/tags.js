const express = require('express');
const router = express.Router();
const { getAllTags, getPostsByTagName } = require('../db')

router.use((req, res, next) => {
  console.log("A request is being made to /tags");

  next();
})

// GET /api/tags
router.get('/', async (req, res, next) => {
  const tags = await getAllTags();

  res.send({
    tags
  })
})

// GET /api/tags/:tagName/posts

router.get('/:tagName/posts', async (req, res, next) => {
  const { tagName } = req.params;

  try {
    const posts = await getPostsByTagName(tagName);
    res.send({ posts });
  } catch ({ name, message }) {
    next({ name, message })
  }
})

module.exports = router;