require("dotenv").config();
const express = require("express");
const app = express();
const connection = require("./db");
const passport = require("passport");
const authRoute = require("./routes/auth.route");
const boardRoute = require("./routes/board.route");
const authMiddleware = require("./middlewares/auth.middleware");
const cookieSession = require("cookie-session");
const cors = require("cors");
app.use(express.json());
const passportStrategy = require("./passport");
app.use(
  cookieSession({
    name: "session",
    keys: ["TaskTracker"],
    maxAge: 1 * 60 * 60 * 1000,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,PATCH,DELETE",
    credentials: true,
  })
);
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
