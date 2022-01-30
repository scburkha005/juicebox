const { Client } = require('pg');
const { rows } = require('pg/lib/defaults');


const client = new Client('postgres://localhost:5433/juicebox-dev');

const getAllUsers = async () => {
  try {
    const { rows: users } = await client.query(
      `SELECT *
      FROM users;
      `);

    return users;
  } catch (err) {
    throw err;
  }
}

const getAllPosts = async () => {
  try {
    const { rows: postIds } = await client.query(
      `SELECT id
      FROM posts;`
    );

    const posts = await Promise.all(postIds.map(post => getPostById(post.id)));
    return posts;
  } catch (err) {
    throw err;
  }
}

const createUser = async ({ username, password, name, location }) => {
  try {
    const { rows: [user] } = await client.query(`
      INSERT INTO users(username, password, name, location)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO NOTHING
      RETURNING *;
    `, [username, password, name, location]);
    return user;
  } catch (error) {
    throw error;
  }
}

const createPost = async ({id, title, content, tags}) => {
  try {
    const { rows: [post] } = await client.query(`
      INSERT INTO posts("authorId", title, content)
      VALUES ($1, $2, $3)
      RETURNING *;
    `, [id, title, content])
    //create new tags if they don't exist
    const tagList = await Promise.all(tags.map(createTag));
    console.log(tagList)
    //returns post w all information added
    return await addTagsToPost(post.id, tagList)
  } catch (err) {
    throw err;
  }
}

const createTag = async (tags) => {
  try {
    const { rows: [tag] } = await client.query(`
      INSERT INTO tags(name)
      VALUES ($1)
      ON CONFLICT (name) DO NOTHING
      RETURNING *;
    `, [tags])

    return tag;
  } catch (err) {
    throw err;
  }
}
//Helper function for addTagsToPost, adds a single tag to a single post
const createPostTag = async (postId, tagId) => {
  try {
    const { rows: [postTag] } = await client.query(`
      INSERT INTO post_tags("postId", "tagId")
      VALUES ($1, $2)
      RETURNING *;
    `, [postId, tagId])
    return postTag;
  } catch (err) {
    throw err;
  }
}

const addTagsToPost = async (postId, tagArray) => {
  try {
    //Add all tags to single post using tagArray
    await Promise.all(tagArray.map((tag) => {
      if (!tag) {
        return;
      }
      createPostTag(postId, tag.id
    )}))

    return await getPostById(postId)
  } catch (err) {
    throw err;
  }
}
//called inside addTagsToPost, returns a single post object containing tags, author, and other post information
const getPostById = async (postId) => {
  try {
    const { rows: [post] } = await client.query(`
      SELECT * FROM posts
      WHERE id = $1; 
    `, [postId]);

    const { rows: tags } = await client.query(`
      SELECT tags.* FROM tags
      JOIN post_tags ON tags.id = post_tags."tagId"
      WHERE "postId" = $1;
    `, [postId]);

    const { rows: [author] } = await client.query(`
      SELECT id, username, name, location
      FROM users
      WHERE id = $1;
    `, [post.authorId]);

    
    const newPost = {...post, tags, author};

    delete newPost.authorId;

    return newPost;
  } catch (err) {
    throw err;
  }
}

async function updateUser(id, fields = {}) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const {rows: [updatedUser]} = await client.query(`
      UPDATE users
      SET ${ setString }
      WHERE id=${ id }
      RETURNING *;
    `, Object.values(fields));

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

const updatePost = async (id, fields = {}) => {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  if (setString.length === 0) {
    return;
  }

  try {
    const {rows: [updatedPost]} = await client.query(`
      UPDATE posts
      SET ${ setString }
      WHERE id=${ id }
      RETURNING *;
    `, Object.values(fields));
    
    return updatedPost;
  } catch (error) {
    throw error;
  }
}
//helper function for getUserById
const getPostsByUser = async (userId) => {
  try {
    const { rows: postIds } = await client.query(`
      SELECT id
      FROM posts
      WHERE "authorId" = $1;
    `, [userId]);

    const posts = await Promise.all(postIds.map(post => getPostById(post.id)))

    return posts;
  } catch (err) {
    throw err;
  }
}

const getUserById = async (userId) => {
  try {
    const {rows: [user]} = await client.query(`
      SELECT * FROM users
      WHERE id = $1;
    `, [userId]);

    // if (!data.rows) {
    //   return;
    // }
    const userPosts = await getPostsByUser(userId);
    const userWithPosts = {...user, userPosts};

    return userWithPosts;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  getAllPosts,
  createPost,
  updatePost,
  getUserById,
  createTag,
  addTagsToPost,
  getPostById
}