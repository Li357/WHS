import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_PATH = '../frontend'; // relative to ./dist/backend once built

app.use(express.json());

app.use(express.static(path.resolve(__dirname, FRONTEND_PATH)));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, FRONTEND_PATH, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
