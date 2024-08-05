const mongoose = require("mongoose");

const connectDb = () => {
  mongoose.connect(process.env.MONGOURI).then((data) => {
    console.log(`Mongose connected with server : ${data.connection.host}`);
  });
};

module.exports = connectDb;
