require("dotenv").config();
const express = require("express");
const app = express();
const connection = require("./db");
const authRoute = require("./routes/auth.route");
const boardRoute = require("./routes/board.route");
const authMiddleware = require("./middlewares/auth.middleware");
const cors = require("cors");
app.use(express.json());
app.use(cors());
app.use("/auth", authRoute);
app.use("/board", authMiddleware, boardRoute);
app.listen(3000, async () => {
  try {
    await connection;
    console.log(`Listening on port 3000`);
  } catch (error) {
    console.log(error);
  }
});
