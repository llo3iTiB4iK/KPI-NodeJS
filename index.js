import express from "express";
const app = express();
const port = 3000; // Оберіть порт, на якому буде працювати сервер

// Маршрут головної сторінки
app.get("/", (req, res) => {
  res.send("Це головна сторінка!");
});

// Маршрут для /about
app.get("/about", (req, res) => {
  res.send('Це сторінка "Про нас".');
});

// Маршрут для /contact
app.get("/contact", (req, res) => {
  res.send('Це сторінка "Контакти".');
});

// Слухати запити на вибраному порту
app.listen(port, () => {
  console.log(`Сервер запущено на порті ${port}`);
});
