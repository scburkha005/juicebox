const { Client } = require('pg');
const client = new Client('postgres://localhost:5433/juicebox-dev');

const getAllUsers = async () => {
  try {
    const { rows: users } = await client.query(
      `SELECT name, username, id, active, location
      FROM users;
      `);

    return users;
  } catch (err) {
    throw err;
  }
}

const getAllTags = async () => {
  try {
    const { rows: tags } = await client.query(
      `SELECT *
      FROM tags;
      `);

    return tags;
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

//Helper function - createPost and updatePost
const createTag = async (tag) => {
  //tag is not an array, its a string = ''
  if (tag.length === 0) {
    return;
  }
  try {
    const { rows: [newTag] } = await client.query(`
      INSERT INTO tags(name)
      VALUES ($1)
      ON CONFLICT (name) DO NOTHING
      RETURNING *;
    `, [tag])
    //If tag already exists, query for it and return it
    if (newTag === undefined) {
      const { rows: [oldTag] } = await client.query(`
        SELECT * from tags
        WHERE name = $1; 
      `, [tag])
      return oldTag
    }

    return newTag;
  } catch (err) {
    throw err;
  }
}

//Helper function for addTagsToPost, inserts data into our through table, postid tagid relation
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

//helper function - createPost and updatePost
const addTagsToPost = async (postId, tagArray) => {
  try {
    //Add all tags to single post using tagArray
    await Promise.all(tagArray.map((tag) => {
      if (!tag) {
        return;
      }
      createPostTag(postId, tag.id)
    }))

    return await getPostById(postId)
  } catch (err) {
    throw err;
  }
}

//Used to initialize our post table information
const createPost = async ({id, title, content, tags}) => {
  try {
    const { rows: [post] } = await client.query(`
      INSERT INTO posts("authorId", title, content)
      VALUES ($1, $2, $3)
      RETURNING *;
    `, [id, title, content])
    //create new tags if they don't exist
    // [''] => createTag('')
    if (tags) {
      const tagList = await Promise.all(tags.map(createTag));
      //returns post w all information added
      return await addTagsToPost(post.id, tagList);
    }
    return await getPostById(post.id);
  } catch (err) {
    console.error(err);
    throw err;
  }
}

//helper function used to grab information from multiple tables and combine into a single post object containing tags, author, and other post information
const getPostById = async (postId) => {
  try {
    const { rows: [post] } = await client.query(`
      SELECT * FROM posts
      WHERE id = $1; 
    `, [postId]);

    if (!post) {
      throw {
        name: "PostNotFoundError",
        message: "Could not find a post with that postId"
      }
    }

    const { rows: tags } = await client.query(`
      SELECT tags.* FROM tags
      JOIN post_tags ON tags.id = post_tags."tagId"
      WHERE "postId" = $1;
    `, [postId]);

    const { rows: [author] } = await client.query(`
      SELECT id, username, name, location, active
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

const updateUser = async (id, fields = {}) => {
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

const updatePost = async (postId, fields = {}) => {
  //remove tags from the object and save for later
  const { tags } = fields;
  delete fields.tags;
  //update post content/title logic
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  try {
    if (setString.length > 0) {
      await client.query(`
        UPDATE posts
        SET ${ setString }
        WHERE id=${ postId }
        RETURNING *;
      `, Object.values(fields));
    }

    // return if no tags to update
    if (tags === undefined) {
      return await getPostById(postId);
    }

    //create new tags
    const tagList = await Promise.all(tags.map(createTag));
    const tagListIdString = tagList.map(
      tag => `${ tag.id }`
    ).join(', ');

    //delete post_tags according to updated post
    await client.query(`
      DELETE FROM post_tags
      WHERE "postId" = $1
      AND "tagId" NOT IN (${tagListIdString});
    `, [postId]);
    //grab duplicate tags
    const { rows: duplicateTags } = await client.query(`
      SELECT * FROM post_tags
      WHERE "postId" = $1;
    `, [postId]);
    //remove duplicate from list to avoid unique constraint on post_tags adding
    const newTagList = tagList.filter((tag) => {
      for (let i = 0; i < duplicateTags.length; i++) {
        if (tag.id !== duplicateTags[i].tagId) {
          return true;
        }
      }
    })

    await addTagsToPost(postId, newTagList);
    
    return await getPostById(postId, tagList)
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
    if (!user) {
      return;
    }

    userPosts = await getPostsByUser(userId);
    const userWithPosts = {...user, userPosts};

    return userWithPosts;
  } catch (err) {
    throw err;
  }
}

const getPostsByTagName = async (tagName) => {
  try {
    const { rows : postIds } = await client.query(`
      SELECT posts.id
      FROM posts
      JOIN post_tags ON posts.id=post_tags."postId"
      JOIN tags ON tags.id=post_tags."tagId"
      WHERE tags.name = $1;
    `, [tagName])

    return await Promise.all(postIds.map(post => getPostById(post.id)))
  } catch (err) {
    throw err;
  }
}

const getUserByUsername = async (username) => {
  try {
    const { rows: [user] } = await client.query(`
      SELECT * FROM users
      WHERE username = $1;
    `, [username]);

    return user;
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
  getPostsByTagName,
  getAllTags,
  getUserByUsername,
  getPostById
}