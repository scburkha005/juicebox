const { 
  client,
  getAllUsers,
  createUser,
  updateUser,
  getAllPosts,
  createPost,
  updatePost,
  getUserById,
  getPostsByTagName
} = require('./index');

const { users, posts } = require('./seedData');

const createInitialUsers = async () => {
  try {
    console.log("Starting to create users...");

    const newUsers = await Promise.all(users.map(createUser))
    console.log(newUsers);

    console.log("Finished creating users!");
  } catch(error) {
    console.error("Error creating users!");
    throw error;
  }
}

const createInitialPosts = async () => {
  try {
    console.log('Starting to create posts...')

    const newPosts = await Promise.all(posts.map(createPost));
    console.log(newPosts);

    console.log('Finished creating posts!')
  } catch (err) {
    throw err;
  }
}

const dropTables = async () => {
  try {
    await client.query(`
    DROP TABLE IF EXISTS post_tags;
    DROP TABLE IF EXISTS tags;
    DROP TABLE IF EXISTS posts;
    DROP TABLE IF EXISTS users;
    `)
  } catch (error) {
    throw error;
  }
}

const createTables = async () => {
  try {
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL,
        name varchar(255) NOT NULL,
        location varchar(255) NOT NULL,
        active BOOLEAN DEFAULT true
      );
      
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        "authorId" INTEGER REFERENCES users(id),
        title varchar(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
      );

      CREATE TABLE tags (
        id SERIAL PRIMARY KEY,
        name varchar(255) UNIQUE NOT NULL
      );

      CREATE TABLE post_tags (
        "postId" INTEGER REFERENCES posts(id),
        "tagId" INTEGER REFERENCES tags(id),
        UNIQUE ("postId", "tagId")
      );
    `)
  } catch (error) {
    throw error;
  }
}


const rebuildDB = async () => {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialPosts();
  } catch (error) {
    console.error(error);
  }
}

const testDB = async () => {
  try {
    console.log("Starting to test database...");

    //Grab all users in the users table
    console.log('Calling getAllUsers')
    const allUsers = await getAllUsers();
    console.log("Result:", users);

    //Check update user functionality
    console.log('Calling updateUser on users[0]');
    const updateUserResult = await updateUser(allUsers[0].id, {
      name: 'Newname Sogood',
      location: 'Lesterville, KY'
    });
    console.log('Result:', updateUserResult);

    //Grab all posts in the posts table
    console.log('Calling getAllPosts');
    const posts = await getAllPosts();
    console.log("Result:", posts);

    //Check update posts functionality
    console.log('Calling updatePost on posts[0]');
    const updatePostResult = await updatePost(posts[0].id, {
      title: "New Title",
      content: "Updated Content"
    });
    console.log('Result:', updatePostResult);

    //Check getting single user from table by ID, should include posts array
    console.log('Calling getUserById with 1');
    const albert = await getUserById(1);
    console.log("Result:", albert);
    
    //test updating tags
    console.log('Calling updatePost on posts[1], only updating tags');
    const updatePostTagsResult = await updatePost(posts[1].id, {
      tags: ['#youcandoanything', '#redfish', '#nofish']
    })
    console.log('Result:', updatePostTagsResult);

    //test getPostByTagName
    console.log('Calling getPostsByTagName with #happy');
    const postsWithHappy = await getPostsByTagName('#happy');
    console.log('Result:', postsWithHappy);

    console.log("Finished database tests!");
  } catch (err) {
    console.error("Error testing database!");
  } 
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());