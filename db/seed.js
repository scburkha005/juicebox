const { 
  client,
  getAllUsers,
  createUser,
  updateUser
} = require('./index');

const { users } = require('./seedData');

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

const dropTables = async () => {
  try {
    await client.query(`
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
        "authorId" INTEGER REFERENCES users(id) NOT NULL,
        title varchar(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
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
  } catch (error) {
    console.error(error);
  }
}

const testDB = async () => {
  try {
    console.log("Starting to test database...");

    console.log('Calling getAllUsers')
    const allUsers = await getAllUsers();
    console.log("Result:", users);

    console.log('Calling updateUser on users[0]');
    const updateUserResult = await updateUser(allUsers[0].id, {
      name: 'Newname Sogood',
      location: 'Lesterville, KY'
    });
    console.log('Result:', updateUserResult);

    console.log("Finished database tests!");
  } catch (err) {
    console.error("Error testing database!");
  } 
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());