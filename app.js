const express = require("express");

const app = express();
const port = 8080;

app.get("/", (req, res) => {
  res.type("text/plain");
  res.send("Hello World !");
});

app.get("/html", (req, res) => {
  res.type("text/html");
  res.send("<h1>Hello World !</h1>");
});

app.listen(port, () => {
  console.log(`The application listens on http://localhost:${port} !`);
});
