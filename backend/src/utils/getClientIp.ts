import { Request } from 'express';

/**
 * Obtém o IP real do cliente, considerando proxies e load balancers
 * Prioriza headers de proxy (X-Forwarded-For, X-Real-IP) sobre req.ip
 */
export function getClientIp(req: Request): string {
  // Tenta pegar do header X-Forwarded-For (usado por proxies como Railway, Vercel, etc)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // X-Forwarded-For pode conter múltiplos IPs separados por vírgula
    // O primeiro é o IP original do cliente
    const ips = (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',');
    const clientIp = ips[0].trim();
    if (clientIp) return clientIp;
  }

  // Tenta pegar do header X-Real-IP
  const realIp = req.headers['x-real-ip'];
  if (realIp && typeof realIp === 'string') {
    return realIp.trim();
  }

  // Tenta pegar do CF-Connecting-IP (Cloudflare)
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp && typeof cfIp === 'string') {
    return cfIp.trim();
  }

  // Fallback para req.ip (pode ser IP interno se atrás de proxy)
  return req.ip || 'unknown';
}
