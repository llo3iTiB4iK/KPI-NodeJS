import http from "http";
import { parse } from "url";
import querystring from "querystring";
const port = process.env.PORT || 3000;

const contentTypes = { // типи даних які може приймати сервер
  json: "application/json",
  urlencode: "application/x-www-form-urlencoded"
};

function parseBody(content, type){ // перетворення даних для подальшої роботи з ними
  if (type === contentTypes.urlencode){ // якщо дані передані в url
    return querystring.parse(content);
  } else { // якщо JSON або інший
    return JSON.parse(content);
  }
};

// Функція обробки маршрутів
function handleRequest(req, res) {
  const parsedUrl = parse(req.url, true);
  const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, "");
  const method = req.method.toLowerCase();
  const queryParams = parsedUrl.query;

  let data = { // створення об'єкту зі всіма даними запиту на сервер
    path,
    method,
    queryParams,
    payload: parseBody(req.body, req.headers["content-type"]),
    headers: req.headers,
  };

  const chosenHandler = router[path] || router['not_found']; // знайти потрібний обробник або повернути інформацію що сторінка не знайдена
  chosenHandler(data, (statusCode = 200, payload = {}, contentType = "application/json") => {
    res.setHeader("Content-Type", contentType);
    res.writeHead(statusCode);
    res.end(payload);
  });
}

const handlers = {};

handlers.root = (data, callback) => {
  callback(200, "Це головна сторінка", "text/plain; charset=utf-8");
};

handlers.sample = (data, callback) => {
  const acceptableMethods = ["post", "get", "options"];

  if (acceptableMethods.indexOf(data.method) > -1) {
    if (data.method === "post") {
      // Handle POST request
      // Example:
      const response = {
        message: "This is a POST request",
        data: data.payload ? JSON.parse(data.payload) : {},
      };

      let contentType = "application/json"; // Default content type for JSON response

      if (data.headers["content-type"] === "application/xml") {
        // Return XML response
        const xmlResponse = `<message>This is a POST request</message>`;
        contentType = "application/xml";
        callback(200, xmlResponse, contentType);
      } else if (data.headers["content-type"] === "multipart/form-data") {
        // Return formdata response
        const formdataResponse = "Field1=Value1&Field2=Value2";
        contentType = "application/x-www-form-urlencoded";
        callback(200, formdataResponse, contentType);
      } else {
        // Return JSON response by default
        callback(200, response, contentType);
      }
    } else if (data.method === "get") {
      // Handle GET request
      // Example:
      const response = {
        message: "This is a GET request",
      };

      // Return XML response for GET request
      const xmlResponse = `<message>This is a GET request</message>`;
      const contentType = "application/xml";
      callback(200, xmlResponse, contentType);
    } else if (data.method === "options") {
      // Handle OPTIONS request
      // Example:
      const response = {
        message: "This is an OPTIONS request",
      };
      const contentType = "application/json";
      callback(200, response, contentType);
    }
  } else {
    callback(405); // Method Not Allowed
  }
};

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
