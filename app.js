const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true })); // this is compulsory
const cookieParser = require("cookie-parser");

app.use(express.json()); // sometimes this need to be used to take data form req.body dont't know why

app.use(cookieParser());

//Route imports
const productRouter = require("./routes/productRoute.js");
const errorhandler = require("./middleware/error.js");
const userRouter = require("./routes/userRoute.js");
const OrderRouter = require("./routes/orderRoutes.js");

app.use("/api/v1", productRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", OrderRouter);

app.use(errorhandler);

module.exports = app;
