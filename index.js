require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');

const { client } = require('./db');

const { PORT } = process.env;
app.listen(PORT, () => {
  client.connect();
  console.log(`The server listening on http://localhost:${PORT}`);
});

app.use(morgan('dev'));
app.use(express.json());

app.use('/api', require('./api'));


//Error handling: 500 errors
app.use(({ name, message }, req, res, next) => {
  res.send({
    name,
    message
  });
});

//Error handling: 404 errors
app.use((req, res, next) => {
  res.status(404).send({
    name: "Path Not Found",
    message: "Page Not Found"
  });
});



app.get('/', (req, res, next) => {
  res.send('This is the home page');
});