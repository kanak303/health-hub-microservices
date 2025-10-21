const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry error'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

module.exports = errorHandler;