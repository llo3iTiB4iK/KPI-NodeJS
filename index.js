import http from "http";
import { parse } from "url";
import { StringDecoder } from "string_decoder";
const port = process.env.PORT || 3000;

// Функція обробки маршрутів
function handleRequest(req, res) {
  const parsedUrl = parse(req.url, true);
  const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, "");
  const method = req.method.toLowerCase();
  const queryParams = parsedUrl.query;

  const decoder = new StringDecoder("utf-8");
  let buffer = "";

  req.on("data", (data) => {
    buffer += decoder.write(data);
  });

  req.on("end", () => {
    buffer += decoder.end();

    const data = {
      path,
      method,
      queryParams,
      payload: buffer,
      headers: req.headers,
    };

    const chosenHandler = router[path] || handlers.notFound;
    chosenHandler(data, (statusCode = 200, payload = {}, contentType = "application/json") => {
      const contentTypes = {
        json: "application/json",
        xml: "application/xml",
        formdata: "multipart/form-data",
        urlencode: "application/x-www-form-urlencoded",
      };

      res.setHeader("Content-Type", contentTypes[contentType] || "application/json");
      res.writeHead(statusCode);
      res.end(JSON.stringify(payload));
    });
  });
}

const handlers = {};

handlers.root = (data, callback) => {
  const response = {
    message: "This is the root route",
  };
  callback(200, response);
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
      callback(200, response);
    } else if (data.method === "get") {
      // Handle GET request
      // Example:
      const response = {
        message: "This is a GET request",
      };
      callback(200, response);
    } else if (data.method === "options") {
      // Handle OPTIONS request
      // Example:
      const response = {
        message: "This is an OPTIONS request",
      };
      callback(200, response);
    }
  } else {
    callback(405); // Method Not Allowed
  }
};

handlers.notFound = (data, callback) => {
  callback(404, { "Content-Type": "text/plain; charset=utf-8", message: "Page not found" });
};

const router = {
  "": handlers.root,
  sample: handlers.sample,
};

// Створити сервер
const server = http.createServer(handleRequest);

// Слухати на заданому порті
server.listen(port, () => {
  console.log(`Сервер запущено на порті ${port}`);
});
