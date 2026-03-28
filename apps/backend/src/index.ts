// src/index.ts
import 'dotenv/config'
import { loadEnv } from './config/env'
import { createApp } from './app'

async function main() {
  const env = loadEnv()
  const app = await createApp(env)

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    console.log(`🚀 Server running at http://localhost:${env.PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

main()
