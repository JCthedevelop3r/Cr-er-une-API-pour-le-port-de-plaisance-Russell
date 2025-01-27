const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

const indexRouter = require("./routes/index");
const mongodb = require("./db/mongo");

mongodb.initClientDbConnection();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");

app.use(
  cors({
    exposedHeaders: ["Authorization"],
    origin: "*",
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);

app.use(function (req, res, next) {
  res
    .status(404)
    .json({ name: "API", version: "1.0", status: 404, message: "not_found" });
});

app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(r.route.path);
  }
});

module.exports = app;
