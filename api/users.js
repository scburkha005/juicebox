const express = require('express');
const router = express.Router();
const { getAllUsers, getUserByUsername, createUser, getUserById, updateUser } = require('../db')
const jwt = require('jsonwebtoken');
const { requireUser } = require('./utils');

const { JWT_SECRET } = process.env;

router.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
})

// GET /api/users
router.get('/', async (req, res, next) => {
  const users = await getAllUsers();

  res.send({
    users
  })
})

// POST api/users/login
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password"
    });
  }

  try {
    const user = await getUserByUsername(username);

    if (user && user.password == password) {
      const token = jwt.sign(user, JWT_SECRET);
      res.send({ token, message: "you're logged in!" });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect"
      });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// POST /api/users/register
router.post('/register', async (req, res, next) => {
  const { username, password, name, location } = req.body;

  try {
    //Check if the user already exists
    const userExists = await getUserByUsername(username);
    
    if (userExists) {
      next({
        name: 'UserExistsError',
        message: 'A user by that username already exists'
      });
    }

    const user = await createUser({
      username,
      password,
      name,
      location
    });

    const token = jwt.sign({
      id: user.id,
      username
    }, JWT_SECRET, {
      expiresIn: '1w'
    });

    res.send({
      message: 'thank you for signing up',
      token
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
})

// DELETE /api/users/:userId
router.delete('/:userId', requireUser, async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await getUserById(userId);
    
    if (!user) {
      next({
        name: "UserNotFound",
        message: "User does not exist"
      });
    } else if (user.id !== req.user.id) {
      next({
        name: "UnauthorizedUser",
        message: "Forbidden user action - can't deactivate another user"
      });
    } else {
        const updatedUser = await updateUser(user.id, { active: false });
        res.send({ user: updatedUser });

    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

//PATCH /api/users/:userId
router.patch('/:userId', requireUser, async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await getUserById(userId);
    
    if (!user) {
      next({
        name: "UserNotFound",
        message: "User does not exist"
      });
    } else if (user.id !== req.user.id) {
      next({
        name: "UnauthorizedUser",
        message: "Forbidden user action - can't deactivate another user"
      });
    } else {
        const updatedUser = await updateUser(user.id, { active: true });
        res.send({ user: updatedUser });
    }
  } catch ({ name, message }) {
      next({ name, message });
  }
})

module.exports = router;