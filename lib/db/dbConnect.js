
const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("DB connected successfully");
  } catch (error) {
    console.log(error);
    console.log("DB connection failed");
  }
};

module.exports = {
  dbConnect,
};
