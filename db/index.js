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
    const { rows: posts } = await client.query(
      `SELECT *
      FROM posts;`
    );
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

const createPost = async ({authorId, title, content}) => {
  try {
    const { rows: [post] } = await client.query(`
      INSERT INTO posts("authorId", title, content)
      VALUES ($1, $2, $3)
      RETURNING *;
    `, [authorId, title, content])
    return post;
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

const getPostsByUser = async (userId) => {
  try {
    const { rows: posts } = await client.query(`
      SELECT * FROM posts
      WHERE "authorId" = $1;
    `, [userId]);

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
  getUserById
}