// Simple, dependency-free rate limiter middleware
// Usage:
//   const { createRateLimiter, loginRateLimiter } = require('./middleware/rateLimiter');
//   app.use('/api/auth/login', loginRateLimiter);
//   // Or create custom limiter:
//   const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });
//   app.use('/api/some-endpoint', limiter);

/**
 * Create a rate limiter middleware.
 * In-memory store suitable for single-instance deployments (like Render free tier).
 * @param {Object} opts
 * @param {number} opts.windowMs - Time window in milliseconds
 * @param {number} opts.max - Max requests allowed in the window
 * @param {(req: import('express').Request) => string} [opts.keyGenerator] - Function to derive a key (defaults to IP)
 * @param {string} [opts.message] - Message returned on limit exceeded
 * @param {number} [opts.statusCode] - HTTP status code for limit exceeded
 * @returns {(req,res,next) => void}
 */
function createRateLimiter({
  windowMs = 1 * 1000,
  max = 100,
  keyGenerator = (req) => req.ip || req.connection?.remoteAddress || 'unknown',
  message = 'Too many requests. Please try again later.',
  statusCode = 429,
} = {}) {
  // Map<key, number[]> of timestamps
  const store = new Map();

  // Periodic cleanup to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, arr] of store.entries()) {
      const filtered = arr.filter((t) => now - t < windowMs);
      if (filtered.length) store.set(key, filtered);
      else store.delete(key);
    }
  }, Math.max(30_000, Math.floor(windowMs / 2)));
  // Do not keep the event loop alive due to cleanup
  cleanupInterval.unref?.();

  return function rateLimiter(req, res, next) {
    // Skip preflight requests
    if (req.method === 'OPTIONS') return next();

    const now = Date.now();
    const key = keyGenerator(req);

    const arr = store.get(key) || [];
    const recent = arr.filter((t) => now - t < windowMs);

    if (recent.length >= max) {
      return res.status(statusCode).json({ success: false, message });
    }

    recent.push(now);
    store.set(key, recent);
    next();
  };
}

// Pre-configured limiter for login: 5 attempts per 15 minutes per IP
const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    // Use path to scope limits per endpoint if needed
    return `login:${ip}`;
  },
  message: 'Too many login attempts. Please try again later.',
});

module.exports = {
  createRateLimiter,
  loginRateLimiter,
};
