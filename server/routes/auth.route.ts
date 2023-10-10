require("dotenv").config();
const router = require("express").Router();
const passport1 = require("passport");
const bcrypt = require("bcrypt");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const config = require("config");
router.post("/google/login", async (req: any, res: any) => {
  const { googleAccessToken } = req.body;
  const { data } = await axios.get(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${googleAccessToken}`,
      },
    }
  );
  let existingUser = await userModel.findOne({
    email: data.email,
  });
  if (existingUser) {
    const token = jwt.sign(
      { userId: existingUser._id, user: existingUser.email },
      process.env.secretKey,
      {
        expiresIn: "1d",
      }
    );
    return res.json({ user: existingUser, token });
  }
  const user = new userModel({
    name: data.displayName,
    email: data.email,
    profilePicture: data.picture,
  });
  await user.save();
  const token = jwt.sign(
    { userId: user._id, user: user.email },
    process.env.secretKey,
    {
      expiresIn: "1d",
    }
  );
  res.json({ user, token });
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
router.get("/logout", (req: any, res: any) => {
  req.session = null;
  res.redirect(process.env.CLIENT_URL);
});
module.exports = router;
