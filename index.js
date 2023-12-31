import http from "http";
import { parse } from "url";
const port = process.env.PORT || 3000;

const contentTypes = { // типи даних які може приймати сервер
  json: "application/json",
  urlencode: "application/x-www-form-urlencoded"
};

function parseBody(content, type, urlParams){ // перетворення даних для подальшої роботи з ними
  if (type === contentTypes.urlencode){ // якщо дані передані в url
    return urlParams;
  } else if (type === contentTypes.json){ // якщо JSON
    return JSON.parse(content);
  } else { // інакше
    return '';
  }
};

// Функція обробки маршрутів
function handleRequest(req, res) {
  const parsedUrl = parse(req.url, true); // розбиваємо url
  const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, ""); // отримуємо шлях запиту
  const method = req.method.toLowerCase(); // отримуємо метод запиту
  const queryParams = parsedUrl.query; // отримуємо

  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString(); // Збираємо дані з тіла запиту
  });

  req.on('end', () => { // Опрацьовуємо body після отримання всіх даних
    let data = { // створення об'єкту зі всіма даними запиту на сервер
      path,
      method,
      queryParams,
      payload: parseBody(body, req.headers["content-type"], queryParams),
      headers: req.headers,
    };
    const chosenHandler = router[path] || router['not_found']; // знайти потрібний обробник або повернути інформацію що сторінка не знайдена
    chosenHandler(data, (statusCode = 200, payload = {}, contentType = "application/json") => { // викликати потрібний обробник і ...
      res.setHeader("Content-Type", contentType); // встановити заголовок з типом даних
      res.writeHead(statusCode); // встановити статус відповіді
      res.end(payload); // відправити відповідь, додавши до неї дані, які користувач має отримати
    });
  });
}

const handlers = {};

handlers.root = (data, callback) => {
  callback(200, "Це головна сторінка", "text/plain; charset=utf-8");
};

handlers.test = (data, callback) => {
  const acceptableMethods = ["post", "get", "options"]; // дозволені методи
  if (acceptableMethods.indexOf(data.method) === -1) { // якщо метод запиту не серед дозволених, повернути повідмлення про це
    callback(405, "Метод не підтримується", "text/plain; charset=utf-8");
  } else { // якщо метод запиту дозволений, провести подальшу обробку
    if (data.method === "post") { // якщо метод post, то повернути відповідне повідомлення та дані у JSON форматі
      const response = {
        message: "Ви відправили POST запит",
        data: data.payload ? data.payload : {},
      };
      callback(200, JSON.stringify(response), "application/json");
    } else if (data.method === "get") { // якщо метод get, то повернути відповідне повідомлення у XML форматі
      callback(200, `<message>Ви відправили GET запит</message>`, "application/xml");
    } else if (data.method === "options") {
      callback(200, "Ви відправили OPTIONS запит", "text/plain; charset=utf-8");
    }
  }
}

handlers.notFound = (data, callback) => {
  callback(404, "Сторінка не знайдена", "text/plain; charset=utf-8");
};

// Виклик функцій-обробників відповідно до маршрутів
const router = {
  "": handlers.root, // обробка маршруту головної сторінки
  test: handlers.test, // обробка тестового маршруту
  not_found: handlers.notFound // обробка випадку, коли сторінка не знайдена
};

// Створити сервер
const server = http.createServer(handleRequest);

// Слухати на заданому порті
server.listen(port, () => {
  console.log(`Сервер запущено на порті ${port}`);
});

// Опрацьовувати сигнали завершення роботи сервера
process.on('SIGTERM', () => {
  shutDown();
});

process.on('SIGINT', () => {
  shutDown();
});

function shutDown() {
  console.log('Зупинка сервера...');

  // Закрити сервер
  listener.close(() => {
    console.log('Сервер зупинено.');
    process.exit(0);
  });
}
