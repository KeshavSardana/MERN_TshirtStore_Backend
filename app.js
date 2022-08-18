// 5th

require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser"); // this is not deprecated . now its inbuilt in express.
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Importing Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const stripePaymentRoutes = require("./routes/stripePayment");
const braintreePaymentRoutes = require("./routes/braintreePayment");

// get your database connected first
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("DB CONNECTED");
  })
  .catch((err) => {
    console.log("DB NOT CONNECTED DUE TO SOME ERROR");
  });

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// My ROUTES
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", stripePaymentRoutes);
app.use("/api", braintreePaymentRoutes);

// PORT
const port = process.env.PORT || 8000;

// Starting a SERVER
app.listen(port, () => {
  console.log(` Server is up and running at port no ${port}`);
});
