const renderError = require("../renderError");

exports.sleepData = (res, data) => {
  try {
      res.send(data);
  } catch (err) {
    renderError(err, res);
  }
};
