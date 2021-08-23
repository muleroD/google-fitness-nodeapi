const renderError = require("../renderError");

exports.simpleDataHeartRate = (res, data) => {
  const bucketArr = data.bucket;
  let heartRateArr = [];

  try {
    for (const item of bucketArr) {
      for (const dataset of item.dataset) {
        for (const point of dataset.point) {
          heartRateArr.push({ point });
        }
      }
    }

    res.json(heartRateArr);
  } catch (err) {
    renderError(err, res);
  }
};
