const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'tiles.json');
const PASSWORD = 'admin123';

app.use(express.json());
app.use(express.static(path.join(__dirname)));

function loadTiles() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [[{ name: 'Przykład 1', url: 'https://example.com', color: '#ffffff' }]];
  }
}

function saveTiles(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/tiles', (req, res) => {
  res.json(loadTiles());
});

app.post('/api/tiles', (req, res) => {
  if (req.headers['x-password'] !== PASSWORD) {
    return res.status(401).json({ error: 'bad password' });
  }
  saveTiles(req.body);
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});
