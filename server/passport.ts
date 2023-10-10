const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserModel = require("./models/user.model");
const passport2 = require("passport");
passport2.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      // callbackURL: "http://localhost:3000/auth/google/callback",
      callbackURL: "https://tasktracker-7obs.onrender.com/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (
      request: any,
      accessToken: any,
      refreshToken: any,
      profile: any,
      callback: any
    ) => {
      try {
        let existingUser = await UserModel.findOne({
          email: profile.emails[0].value,
        });
        if (existingUser) {
          return callback(null, existingUser);
        }
        const newUser = new UserModel({
          name: profile.displayName,
          email: profile.emails[0].value,
          profilePicture: profile.photos[0].value,
        });
        await newUser.save();
        return callback(null, newUser);
      } catch (error) {
        return callback(error, false);
      }
    }
  )
);
passport2.serializeUser((user: any, done: any) => {
  done(null, user);
});

passport2.deserializeUser((user: any, done: any) => {
  done(null, user);
});
