export function notFound(req, res, next) {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
}

// General error handler
export function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.stack || err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Server error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
}
