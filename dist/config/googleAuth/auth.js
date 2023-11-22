"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const GOOGLE_CLIENT_ID = "1010673192618-alckb3amf1bdoptoh7d5mpojn2ve201t.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
passport_1.default.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5001/google/callback",
    passReqToCallback: true,
}, function (request, accessToken, refreshToken, profile, done) {
    //   User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return done(null, profile);
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((user, done) => {
    done(null, user);
});
