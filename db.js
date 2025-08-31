const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB подключена");
  } catch (error) {
    console.error("❌ Ошибка подключения MongoDB:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
