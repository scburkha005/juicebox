const express = require('express');
const app = express();
const morgan = require('morgan');
const { client } = require('./db');

require('dotenv').config();
const { PORT } = process.env;

app.listen(PORT, () => {
  client.connect();
  console.log(`The server listening on http://localhost:${PORT}`);
});

app.use(morgan('dev'));
app.use(express.json());

app.use('/api', require('./api'));

app.get('/', (req, res, next) => {
  res.send('This is the home page');
});