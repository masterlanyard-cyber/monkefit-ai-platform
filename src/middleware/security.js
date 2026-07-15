const buckets = new Map();

function allowedOrigins() {
  return new Set(
    String(process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  );
}

export function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  const origins = allowedOrigins();

  if (origin && (origins.size === 0 || origins.has(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  return next();
}

export function apiKeyMiddleware(req, res, next) {
  const configured = process.env.API_SECRET;
  const publicPaths = new Set(['/', '/api/health']);
  if (!configured || publicPaths.has(req.path)) return next();

  const provided = req.header('X-API-Key');
  if (provided !== configured) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  return next();
}

export function rateLimitMiddleware(req, res, next) {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
  const maxRequests = Number(process.env.RATE_LIMIT_MAX || 60);
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  current.count += 1;
  if (current.count > maxRequests) {
    res.setHeader('Retry-After', Math.ceil((current.resetAt - now) / 1000));
    return res.status(429).json({ success: false, error: 'Too many requests' });
  }
  return next();
}
