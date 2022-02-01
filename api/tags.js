const express = require('express');
const router = express.Router();
const { getAllTags } = require('../db')

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

module.exports = router;