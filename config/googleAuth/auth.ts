import passport, { Profile } from "passport";
import IRequest from "../../interfaces/IRequest";

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
    function (
      request: IRequest,
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: any
    ) {
      //   User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});
