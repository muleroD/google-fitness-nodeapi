const express = require("express");
const router = express.Router();
const { isEmpty } = require("lodash");
const axios = require('axios');

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

// User info
router.get("/session", (req, res, next) => {
  axios
    .get("https://fitness.googleapis.com/fitness/v1/users/me/sessions", {
      headers: { authorization: getAuthorization() },
    })
    .then(({ data }) => res.send(data))
    .catch((err) => res.send(err));
});

router.get("/dataSources", (req, res, next) => {
  axios
    .get("https://fitness.googleapis.com/fitness/v1/users/me/dataSources", {
      headers: { authorization: getAuthorization() },
    })
    .then(({ data }) => res.send(data))
    .catch((err) => res.send(err));
});

function getAuthorization() {
  return "Bearer " + oauth2Client.credentials.access_token;
}

module.exports = router;
