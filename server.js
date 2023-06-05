const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const accounts = [
  { id: 1, name: 'user1', role: 'Admin', username: 'admin', password: 'admin123' },
  { id: 2, name: 'user2', role: 'User', username: 'user', password: 'user123' }
];

const secretKey = 'your-secret-key';

// Генерація токена
function generateToken(name) {
  return jwt.sign({ name }, secretKey);
}

// Перевірка ролі "Admin"
function isAdmin(req, res, next) {
  const { username, password } = req.query;

  // Здійснюємо перевірку логіну та паролю
  const account = accounts.find(acc => acc.username === username && acc.password === password);
  if (!account || account.role !== 'Admin') {
    return res.status(401).json({ error: 'Access denied' });
  }

  req.account = account;
  next();
}

// Отримання всіх облікових записів
app.get('/accounts', (req, res) => {
  res.json(accounts);
});

// Отримання токену для певного облікового запису
app.get('/accounts/token', (req, res) => {
  const { name } = req.query;

  const account = accounts.find(acc => acc.name === name);
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const token = generateToken(account.name);
  res.json({ token });
});

// Додавання нового облікового запису (тільки для ролі "Admin")
app.post('/accounts', isAdmin, (req, res) => {
  const { id, name, role, username, password } = req.body;

  const newAccount = { id, name, role, username, password };
  accounts.push(newAccount);

  res.status(201).json(newAccount);
});

// Оновлення облікового запису (тільки для ролі "Admin")
app.put('/accounts/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const { name, role, username, password } = req.body;

  const account = accounts.find(acc => acc.id === Number(id));
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  account.name = name;
  account.role = role;
  account.username = username;
  account.password = password;

  res.json(account);
});

// Видалення облікового запису (тільки для ролі "Admin")
app.delete('/accounts/:id', isAdmin, (req, res) => {
  const { id } = req.params;

  const index = accounts.findIndex(acc => acc.id === Number(id));
  if (index === -1) {
    return res.status(404).json({ error: 'Account not found' });
  }

  accounts.splice(index, 1);

  res.json({ message: 'Account deleted' });
});

// Запуск сервера
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});

app.get("/", (req, res) => {
    res.send("Hello, World!");
  });
  
