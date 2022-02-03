const express = require('express');
const app = express();
const morgan = require('morgan');
const { client } = require('./db');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const { PORT, JWT_SECRET } = process.env;

app.listen(PORT, () => {
  client.connect();
  console.log(`The server listening on http://localhost:${PORT}`);
});

app.use(morgan('dev'));
app.use(express.json());

app.use('/api', require('./api'));

app.use((req, res, next) => {
  const token = jwt.sign({"username": "albert", "password": "bertie99"}, JWT_SECRET);
  console.log(token)
  next();
})

app.get('/', (req, res, next) => {
  // res.status(404).send()
  res.send('This is the home page');
});