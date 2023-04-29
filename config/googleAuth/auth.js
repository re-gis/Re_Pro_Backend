const passport = require('passport')


const GoogleStrategy = require("passport-google-oauth2").Strategy;
const GOOGLE_CLIENT_ID =
  "1010673192618-alckb3amf1bdoptoh7d5mpojn2ve201t.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5001/google/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      //   User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});