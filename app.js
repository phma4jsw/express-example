const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, Model, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');

// get config vars
dotenv.config();

const app = express();
const port = 3000;

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

// Define User model
class User extends Model {}
User.init({
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING
}, { sequelize, modelName: 'user' });

// Sync models with database
sequelize.sync();

// Middleware for parsing request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/login', (req, res) => {
    // Read username and password from request body
    const { username, password } = req.body;
    console.log(username)
    // Filter user from the users array by username and password
    const user = User.findAll({
        attributes: ['email'],
        where: { 
            email: username,
            password: password }
        });

    if (user) {
        console.log(username)
        // Generate an access token
        const accessToken = generateAccessToken(username);
        res.json({
            accessToken
        });
    } else {
        res.send('Username or password incorrect');
    }
});

// CRUD routes for User model
app.get('/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

app.get('/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  res.json(user);
});

app.post('/users', async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});

app.put('/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (user) {
    await user.update(req.body);
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.delete('/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (user) {
    await user.destroy();
    res.json({ message: 'User deleted' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

function generateAccessToken(username) {
    return jwt.sign({ username: username }, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
  }