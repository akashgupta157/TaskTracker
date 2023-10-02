require("dotenv").config();
const router = require("express").Router();
const passport1 = require("passport");
const bcrypt = require("bcrypt");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
router.get("/login/success", (req: any, res: any) => {
    if (req.user) {
        const token = jwt.sign(
            { userId: req.user._id, user: req.user.email },
            process.env.secretKey,
            {
                expiresIn: "1d",
            }
        );
        res.status(200).json({
            error: false,
            message: "Successfully Loged In",
            user: req.user,
            token
        });
    } else {
        res.status(403).json({ error: true, message: "Not Authorized" });
    }
});
router.get("/login/failed", (req: any, res: any) => {
    res.status(401).json({
        error: true,
        message: "Log in failure",
    });
});
router.get("/google", passport1.authenticate("google", ["profile", "email"]));
router.get(
    "/google/callback",
    passport1.authenticate("google", {
        successRedirect: process.env.CLIENT_URL,
        failureRedirect: "/login/failed",
    })
);
router.get("/logout", (req: any, res: any) => {
    req.logout();
    res.redirect(process.env.CLIENT_URL);
});
router.post("/register", async (req: any, res: any) => {
    try {
        const { email, password } = req.body;
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({
                message: "User already exists, please login",
                auth: false,
            });
        }
        bcrypt.hash(password, 5, async (err: any, hash: any) => {
            if (err) {
                res.json({ err: err.message });
            } else {
                const user = new userModel({ ...req.body, password: hash });
                await user.save();
                res.json({
                    message: "User has been Registered successfully",
                    auth: true,
                });
            }
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});
router.post("/login", async (req: any, res: any) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ message: "Email not found", auth: false });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.json({ message: "Incorrect Password", auth: false });
        }
        const token = jwt.sign(
            { userId: user._id, user: user.email },
            process.env.secretKey,
            {
                expiresIn: "1d",
            }
        );
        res.json({ message: "Login successful", user, token, auth: true });
    } catch (error) {
        res.json({ message: error.message });
    }
});
module.exports = router;
