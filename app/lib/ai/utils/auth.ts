export function validateCronSecret(request: Request): boolean {
  return request.headers.get('x-cron-secret') === process.env.CRON_SECRET
}
