const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet')
const path = require('path');
const { HttpCode } = require('./helpers/constants');

const contactsRouter = require('./routes/api/contacts');
const usersRouter = require('./routes/api/users');
require('dotenv').config();

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';
const PUBLIC_DIR = process.env.PUBLIC_DIR;

app.use(express.static(path.join(__dirname, PUBLIC_DIR)));

app.use(helmet())
app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/contacts', contactsRouter);

app.use((req, res) => {
  res.status(HttpCode.BAD_REQUEST).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  res
    .status(err.status || HttpCode.INTERNAL_SERVER_ERROR)
    .json({ message: err.message });
});

module.exports = app;