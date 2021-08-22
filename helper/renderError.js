module.exports = function (err, res) {
  res.locals.message = err.message;
  res.locals.error = err;

  res.status(err.status || 500);
  res.render("error");
};
