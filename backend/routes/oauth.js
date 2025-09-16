const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const generateAuthToken = require("../utils/generateAuthToken");
require("dotenv").config();

const router = express.Router();

// --- Настройка Google стратегии ---
const GoogleStrategy = require("passport-google-oauth20").Strategy;
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/oauth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: Math.random().toString(36).slice(-8), // заглушка, пароль не используется
          });
          await user.save();
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// --- Настройка Facebook стратегии ---
const FacebookStrategy = require("passport-facebook").Strategy;
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/oauth/facebook/callback`,
      profileFields: ["id", "displayName", "emails"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `${profile.id}@facebook.com`;
        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            name: profile.displayName,
            email,
            password: Math.random().toString(36).slice(-8),
          });
          await user.save();
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// --- Роуты ---
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = generateAuthToken(req.user);
    // редирект на фронтенд с токеном в query
    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);
  }
);

router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req, res) => {
    const token = generateAuthToken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);
  }
);

module.exports = router;
