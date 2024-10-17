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
const router = require("express").Router();
const passport1 = require("passport");
const bcrypt = require("bcrypt");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const config = require("config");
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.send("Welcome User");
    }
    catch (error) {
        res.status(404).send(error.message);
    }
}));
router.post("/google/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { googleAccessToken } = req.body;
    const { data } = yield axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
            Authorization: `Bearer ${googleAccessToken}`,
        },
    });
    let existingUser = yield userModel.findOne({
        email: data.email,
    });
    if (existingUser) {
        const token = jwt.sign({ userId: existingUser._id, user: existingUser.email }, process.env.secretKey, {
            expiresIn: "24h",
        });
        return res.json({ user: existingUser, token });
    }
    const user = new userModel({
        email: data.email,
        profilePicture: data.picture,
        name: data.name,
    });
    yield user.save();
    const token = jwt.sign({ userId: user._id, user: user.email }, process.env.secretKey, {
        expiresIn: "24h",
    });
    res.json({ user, token });
}));
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const existingUser = yield userModel.findOne({ email });
        if (existingUser) {
            return res.json({
                message: "User already exists, please login",
                auth: false,
            });
        }
        bcrypt.hash(password, 5, (err, hash) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                res.json({ err: err.message });
            }
            else {
                const user = new userModel(Object.assign(Object.assign({}, req.body), { password: hash }));
                yield user.save();
                res.json({
                    message: "User has been Registered successfully",
                    auth: true,
                });
            }
        }));
    }
    catch (error) {
        res.json({ error: error.message });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield userModel.findOne({ email });
        if (!user) {
            return res.json({ message: "Email not found", auth: false });
        }
        const passwordMatch = yield bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.json({ message: "Incorrect Password", auth: false });
        }
        const token = jwt.sign({ userId: user._id, user: user.email }, process.env.secretKey, {
            expiresIn: "24h",
        });
        res.json({ message: "Login successful", user, token, auth: true });
    }
    catch (error) {
        res.json({ message: error.message });
    }
}));
router.get("/logout", (req, res) => {
    req.session = null;
    res.redirect(process.env.CLIENT_URL);
});
module.exports = router;
