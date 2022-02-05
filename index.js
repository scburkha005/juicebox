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

app.get('/', (req, res, next) => {
  res.send('This is the home page');
});

// app.get('/background/:color', (req, res, next) => {
//   res.send(`
//     <body style="background: ${ req.params.color };">
//       <h1>Hello World</h1>
//     </body>
//   `);
// });

// app.get('/add/:first/to/:second', (req, res, next) => {
//   res.send(`
//   <h1> ${ req.params.first } + ${ req.params.second } = ${
//     Number(req.params.first) + Number(req.params.second)}
//   </h1>
//    `);
// });