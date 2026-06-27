export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateRequiredEnv } = await import('./lib/requiredEnv.js')
    validateRequiredEnv({ crash: process.env.NODE_ENV === 'production' })
  }
}
