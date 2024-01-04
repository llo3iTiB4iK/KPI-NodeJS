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
      res.end(payload);
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
  callback(404, { message: "Page not found" }, "text/plain; charset=utf-8");
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
