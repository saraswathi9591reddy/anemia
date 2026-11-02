const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'Something went wrong');
  res.status(status).json({ error: message });
};
module.exports = errorHandler;

