export function getAppUrl(): string {
  const candidates = [
    process.env.FRONTEND_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : undefined,
    'https://despa-facil.vercel.app',
  ].filter(Boolean) as string[]

  const url = candidates[0]!
  return url.replace(/\/+$/, '')
}
