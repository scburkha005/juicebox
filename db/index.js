const { Client } = require('pg');


const client = new Client('postgres://localhost:5433/juicebox-dev');

const getAllUsers = async () => {
  const { rows: users } = await client.query(
    `SELECT *
    FROM users;
    `);

  return users;
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

// fields = {
//   username: *,
//   password: *,
//   location: *,
//   name: *,
//   active: false
// }

// updateUser(somenumber, {name: scott location: bayarea}) "firstName"
async function updateUser(id, fields = {}) {
  // build the set string
  //Object.keys = [name, location]
  //[name, location].map((objectKey, index)
  //   return (
  //  `"${objectKey}" = $ ${index + 1}`
  //    `"name" = $ 1 + 0`
  //    `"location" = $ 2
  //)
  //)
  // ====> [`"name" = $1`, `"location"= $2`].join(', ');
  //
  //  setString = ` "name" = $1, "location" = $2 `
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  // setString = "name"='new name', "location"='new location'

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
    //{name: scott, location: bayarea}
    //Object.values => [scott, bayarea]

    return updatedUser;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser
}