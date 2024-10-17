"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
app.listen(3000, () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield connection;
        console.log(`Listening on port 3000`);
    }
    catch (error) {
        console.log(error);
    }
}));
