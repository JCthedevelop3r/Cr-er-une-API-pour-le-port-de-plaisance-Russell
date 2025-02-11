require("dotenv").config();  // Charger les variables d'environnement dès le début
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const getCatwaysWithReservations =
  require("./middlewares/catways").getCatwaysWithReservations;

const indexRouter = require("./routes/index");
const mongodb = require("./mongo");

mongodb.initClientDbConnection();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
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
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(getCatwaysWithReservations);
app.use(session({
  secret: "pl84nm95sz3258",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 10000 }
}));

app.use("/", indexRouter);

app.use(function (req, res, next) {
  res
    .status(404)
    .json({ name: "API", version: "1.0", status: 404, message: "not_found" });
});

module.exports = app;
