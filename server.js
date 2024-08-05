const app = require("./app");
const connectDb = require("./config/db.js");

//config
require("dotenv").config({ path: "config/config.env" });

// Handling Uncaught Exception error
process.on("uncaughtException", (err) => {
  console.log(`Error : ${err.message}`);
  console.log(`Shutting down the server due to uncaught error `);
  process.exit(1);
});

// Connecting database
connectDb();

const server = app.listen(process.env.PORT, () => {
  console.log(`server is running on http://localhost:${process.env.PORT}`);
});

// unhandled promise rejection - mongo error handler
process.on("unhandledRejection", (err) => {
  console.log(`Error : ${err.message}`);
  console.log("Shutting down the server due to unhandled promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
