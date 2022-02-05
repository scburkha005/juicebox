const express = require('express');
const router = express.Router();
const { getAllPosts, createPost, updatePost, getPostById } = require('../db')
const { requireUser } = require('./utils');

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
});

//POST /api/posts
router.post('/', requireUser, async(req, res, next) => {
  const { title, content, tags = '' } = req.body;
  if (!title || !content) {
    next({
      name: "MissingRequiredFields",
      message: "Please supply both the title and content"
    });
  }
  const { id } = req.user;

  //  \s+ regex to split on 1 to infinite whitespace
  const postData = {};
  // const tagArr = tags.trim().split(/\s+/);
  // console.log('tagarr:', tagArr.length)

  if (tags.length) {
    const tagArr = tags.trim().split(/\s+/);
    postData.tags = tagArr;
  }

  try {
    const newPostData = {...postData, title, content, id};
    const post = await createPost(newPostData);
    if (post) {
      res.send({ post });
    } // do we need an else to next() an error object, or does the catch handle all of that for us
  } catch ({ name, message }) {
    next({ name, message });
  }
})

// PATCH /api/
router.patch('/:postId', requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    //create array out of tags string and add it to the updateFields object
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost});
    } else {
      next({
        name: "UnauthorizedUserError",
        message: "You cannot update a post that is not yours"
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = router;