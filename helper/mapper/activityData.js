const renderError = require("../renderError");

exports.sumTotalAndListAllSteps = (res, data) => {
  const bucketArr = data.bucket;
  let stepsTotal = 0;
  let stepsArr = [];

  try {
    for (const item of bucketArr) {
      for (const dataset of item.dataset) {
        for (const point of dataset.point) {
          for (const value of point.value) {
            stepsTotal += value.intVal;
            stepsArr.push(value.intVal);
          }
        }
      }
    }

    res.json({ stepsTotal, stepsArr });
  } catch (err) {
    renderError(err, res);
  }
};
