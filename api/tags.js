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
    //12   -   12
    const postsContainTag = await getPostsByTagName(tagName);
    // posts => active = true OR where you are the author of post
    const posts = postsContainTag.filter(post => {
      return (post.author.active && post.active) || (req.user && post.author.id === req.user.id);
    });
    res.send({ posts });
  } catch ({ name, message }) {
    next({ name, message });
  }
})

module.exports = router;