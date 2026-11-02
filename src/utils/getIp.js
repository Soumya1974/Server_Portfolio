/**
 * Extracts and normalizes the client IP address from request headers or socket.
 * Handles reverse proxies, load balancers (Cloudflare, AWS ALB, Vercel, Nginx),
 * and IPv6-mapped IPv4 addresses.
 */
export function getClientIp(req) {
  let ip = '';

  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // If multiple comma-separated IPs, the first one is the original client IP
    ip = forwarded.split(',')[0].trim();
  } else if (req.headers['x-real-ip']) {
    ip = req.headers['x-real-ip'].trim();
  } else if (req.headers['cf-connecting-ip']) {
    ip = req.headers['cf-connecting-ip'].trim();
  } else {
    ip = req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || '';
  }

  // Normalize IPv4-mapped IPv6 (::ffff:192.168.1.1 -> 192.168.1.1)
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  // Normalize IPv6 localhost to IPv4 localhost
  if (ip === '::1') {
    ip = '127.0.0.1';
  }

  return ip || '127.0.0.1';
}
