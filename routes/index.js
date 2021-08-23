const express = require("express");
const router = express.Router();
const moment = require("moment");
const { isEmpty } = require("lodash");
const { default: axios } = require("axios");

const { clientId, clientSecret, redirectUri } = require("../config/google");
const renderError = require("../helper/renderError");

const activityDataMapper = require("../helper/mapper/activityData");
const bodyDataMapper = require("../helper/mapper/bodyData");
const sleepDataMapper = require("../helper/mapper/sleepData");

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
  "https://www.googleapis.com/auth/fitness.reproductive_health.write"
];

////////////////////////////////
// Init | Login
////////////////////////////////

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
        userId: req.body.userId
      })
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

////////////////////////////////
// User info
////////////////////////////////

router.get("/session", (req, res, next) => {
  axios
    .get("https://fitness.googleapis.com/fitness/v1/users/me/sessions", { headers: getAuthorization() })
    .then(({ data }) => res.send(data))
    .catch(err => renderError(err, res));
});

router.get("/dataSources", (req, res, next) => {
  axios
    .get("https://fitness.googleapis.com/fitness/v1/users/me/dataSources", { headers: getAuthorization() })
    .then(({ data }) => res.send(data))
    .catch(err => renderError(err, res));
});

router.get("/aggregate-example", (req, res, next) => {
  const body = {
    aggregateBy: [
      {
        dataTypeName: "com.google.step_count.delta",
        dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
      }
    ],
    bucketByTime: { durationMillis: 86400000 }, // This is 24 hours
    startTimeMillis: moment().valueOf(), // Define start date
    endTimeMillis: moment().valueOf() // Define end date
  };

  axios
    .post("https://fitness.googleapis.com/fitness/v1/users/me/dataset:aggregate", body, { headers: getAuthorization() })
    .then(({ data }) => res.send(data))
    .catch(err => renderError(err, res));
});

////////////////////////////////
// Activity data types
// https://developers.google.com/fit/datatypes/activity
////////////////////////////////

router.get("/step_count-delta", (req, res, next) => {
  const body = getAggregateBy("com.google.step_count.delta", "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps", "01062021");

  axios
    .post("https://fitness.googleapis.com/fitness/v1/users/me/dataset:aggregate", body, { headers: getAuthorization() })
    .then(({ data }) => activityDataMapper.sumTotalAndListAllSteps(res, data))
    .catch(err => renderError(err, res));
});

////////////////////////////////
// Body data types
// https://developers.google.com/fit/datatypes/body
////////////////////////////////

router.get("/heart-rate", (req, res, next) => {
  const body = getAggregateBy("com.google.heart_rate.bpm", "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm", "01062021");

  axios
    .post("https://fitness.googleapis.com/fitness/v1/users/me/dataset:aggregate", body, { headers: getAuthorization() })
    .then(({ data }) => bodyDataMapper.simpleDataHeartRate(res, data))
    .catch(err => renderError(err, res));
});

////////////////////////////////
// Sleep data type
// https://developers.google.com/fit/datatypes/sleep
////////////////////////////////

router.get("/sleep", (req, res, next) => {
  const body = getAggregateBy("com.google.sleep.segment", "derived:com.google.sleep.segment:com.google.android.gms:merged", "01062021");

  axios
    .post("https://fitness.googleapis.com/fitness/v1/users/me/dataset:aggregate", body, { headers: getAuthorization() })
    .then(({ data }) => sleepDataMapper.sleepData(res, data))
    .catch(err => renderError(err, res));
});

function getAuthorization() {
  return { authorization: "Bearer " + oauth2Client.credentials.access_token };
}

function getAggregateBy(dataTypeName, dataSourceId, start = null, end = null, durationMillis = 86400000, format = "DDMMYYYY") {
  return {
    aggregateBy: [{ dataTypeName, dataSourceId }],
    bucketByTime: { durationMillis }, // 86400000 is 24 hours
    startTimeMillis: start ? moment(start, format).valueOf() : moment().valueOf(),
    endTimeMillis: end ? moment(end, format).valueOf() : moment().valueOf()
  };
}

module.exports = router;
