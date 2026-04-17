import { rateLimit } from './rate-limit';

serve(async (req) => {
  const ip = req.headers.get('x-forwarded-for');
  
  // Allow 5 registrations per IP per hour
  if (!await rateLimit(ip, 5, 3600)) {
    return new Response('Too many requests', { status: 429 });
  }
  
  // Process registration...
});