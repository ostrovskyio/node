// API at swagger.json

const express = require('express');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(express.json());

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

const secretKey = 'your-secret-key';

// Token generation
function generateToken(name) {
  return jwt.sign({ name }, secretKey);
}

// Check role "Admin"
async function isAdmin(req, res, next) {
  const { username, password } = req.query;

  try {
    // Check login and password
    const account = await Account.findOne({
      where: {
        username,
        password
      }
    });

    if (!account || account.role !== 'Admin') {
      return res.status(401).json({ error: 'Access denied' });
    }

    req.account = account;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Getting all accounts
app.get('/accounts', async (req, res) => {
  try {
    const accounts = await Account.findAll();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Receiving a token for a specific account
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

// Adding a new account (only for "Admin")
app.post('/accounts', isAdmin, async (req, res) => {
  const { id, name, role, username, password } = req.body;

  try {
    const newAccount = await Account.create({ id, name, role, username, password });
    res.status(201).json(newAccount);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Account update (only for "Admin")
app.put('/accounts/:id', isAdmin, async (req, res) => {
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

// Delete account (only for "Admin")
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

// Start server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// API at swagger.json

  
