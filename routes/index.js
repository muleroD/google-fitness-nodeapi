const express = require("express");
const router = express.Router();
const { isEmpty } = require("lodash");

const { clientId, clientSecret, redirectUri } = require("../config/google");

const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);

const scopes = [
  "https://www.googleapis.com/auth/fitness.blood_pressure.read",
  "https://www.googleapis.com/auth/fitness.location.write",
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.blood_glucose.write",
  "https://www.googleapis.com/auth/fitness.heart_rate.write",
  "https://www.googleapis.com/auth/fitness.oxygen_saturation.write",
  "https://www.googleapis.com/auth/fitness.blood_glucose.read",
  "https://www.googleapis.com/auth/fitness.body.write",
  "https://www.googleapis.com/auth/fitness.location.read",
  "https://www.googleapis.com/auth/fitness.oxygen_saturation.read",
  "https://www.googleapis.com/auth/fitness.body.read",
  "https://www.googleapis.com/auth/fitness.sleep.write",
  "https://www.googleapis.com/auth/fitness.body_temperature.write",
  "https://www.googleapis.com/auth/fitness.nutrition.write",
  "https://www.googleapis.com/auth/fitness.body_temperature.read",
  "https://www.googleapis.com/auth/fitness.nutrition.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.blood_pressure.write",
  "https://www.googleapis.com/auth/fitness.activity.write",
  "https://www.googleapis.com/auth/fitness.reproductive_health.read",
  "https://www.googleapis.com/auth/fitness.reproductive_health.write",
];

router.get("/", (req, res, next) => {
  if (!isEmpty(oauth2Client.credentials)) {
    console.log("Credentials are present!");
    res.render("index", { title: "Health Hub" });
  } else {
    console.log("No credentials present");

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      state: JSON.stringify({
        callbackUrl: req.body.callbackUrl,
        userId: req.body.userId,
      }),
    });

    res.redirect(url);
  }
});

router.get("/oauth2callback", (req, res, next) => {
  const code = req.query.code;

  oauth2Client.getToken(code, (err, token) => {
    oauth2Client.setCredentials(token);
    console.log("Token set, redirecting to /");
    res.redirect("/");
  });
});

module.exports = router;
