const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const cors = require("cors");
const express = require("express");
const path = require("path");
const AppError = require("./utils/appError");
const errorHandler = require("./controllers/errorController");
const mongoose = require("mongoose");
const app = express();
const morgan = require("morgan");
const categoryRouter = require("./routes/categoryRoutes");

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("connected successfully to db");
  })
  .catch((e) => {
    console.log("error while connecting " + e.message);
  });

app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log("hello");
  req.requestTime = new Date().toISOString();
  console.log(req.requestTime);
  next();
});
app.use("/api/v1/categories", categoryRouter);


app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.url} on server`, 404));
});
app.use(errorHandler);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log("listening on port " + port);
});
