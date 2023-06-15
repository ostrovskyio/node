// API at swagger.json

const express = require('express');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());

// MySQL configuration
const sequelize = new Sequelize('test', 'test', 'test', {
  host: 'localhost',
  dialect: 'mysql'
});

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// MongoDB configuration
const mongoURI = 'mongodb://localhost:27017/test';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const mongoAccountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});
const MongoAccount = mongoose.model('MongoAccount', mongoAccountSchema);

const secretKey = 'your-secret-key';

// Token generation
function generateToken(name) {
  const token = jwt.sign({ name }, secretKey, { expiresIn: '1h' });
  return token;
}

// Validate request data using express-validator
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// Check role "Admin"
async function isAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  try {
    // Verify and decode the token
    const decodedToken = jwt.verify(token, secretKey);

    if (!decodedToken || decodedToken.role !== 'Admin') {
      return res.status(401).json({ error: 'Access denied' });
    }

    req.decodedToken = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Getting all accounts from MySQL
app.get('/accounts', isAdmin, async (req, res) => {
  try {
    const accounts = await Account.findAll();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Getting all accounts from MongoDB
app.get('/accounts/mongo', isAdmin, async (req, res) => {
  try {
    const accounts = await MongoAccount.find();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Receiving a token for a specific account from MySQL
app.get('/accounts/token', async (req, res) => {
  const { name } = req.query;

  try {
    const account = await Account.findOne({
      where: {
        name
      }
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const token = generateToken(account.name);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Receiving a token for a specific account from MongoDB
app.get('/accounts/mongo/token', async (req, res) => {
  const { name } = req.query;

  try {
    const account = await MongoAccount.findOne({
      name
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const token = generateToken(account.name);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Adding a new account to MySQL (only for "Admin")
app.post('/accounts', isAdmin, [
  body('name').notEmpty().trim().escape(),
  body('role').notEmpty().trim().escape(),
  body('username').notEmpty().trim().escape(),
  body('password').notEmpty().trim().escape(),
  validateRequest
], async (req, res) => {
  const { id, name, role, username, password } = req.body;

  try {
    const newAccount = await Account.create({ id, name, role, username, password });
    res.status(201).json(newAccount);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Adding a new account to MongoDB (only for "Admin")
app.post('/accounts/mongo', isAdmin, [
  body('name').notEmpty().trim().escape(),
  body('role').notEmpty().trim().escape(),
  body('username').notEmpty().trim().escape(),
  body('password').notEmpty().trim().escape(),
  validateRequest
], async (req, res) => {
  const { name, role, username, password } = req.body;

  try {
    const newAccount = await MongoAccount.create({ name, role, username, password });
    res.status(201).json(newAccount);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Account update in MySQL (only for "Admin")
app.put('/accounts/:id', isAdmin, [
  body('name').notEmpty().trim().escape(),
  body('role').notEmpty().trim().escape(),
  body('username').notEmpty().trim().escape(),
  body('password').notEmpty().trim().escape(),
  validateRequest
], async (req, res) => {
  const { id } = req.params;
  const { name, role, username, password } = req.body;

  try {
    const account = await Account.findByPk(id);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    account.name = name;
    account.role = role;
    account.username = username;
    account.password = password;

    await account.save();

    res.json(account);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Account update in MongoDB (only for "Admin")
app.put('/accounts/mongo/:id', isAdmin, [
  body('name').notEmpty().trim().escape(),
  body('role').notEmpty().trim().escape(),
  body('username').notEmpty().trim().escape(),
  body('password').notEmpty().trim().escape(),
  validateRequest
], async (req, res) => {
  const { id } = req.params;
  const { name, role, username, password } = req.body;

  try {
    const account = await MongoAccount.findOneAndUpdate(
      { _id: id },
      { name, role, username, password },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete account from MySQL (only for "Admin")
app.delete('/accounts/:id', isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const account = await Account.findByPk(id);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await account.destroy();

    res.json({ message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete account from MongoDB (only for "Admin")
app.delete('/accounts/mongo/:id', isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const account = await MongoAccount.findOneAndDelete({ _id: id });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});


// API at swagger.json

  
