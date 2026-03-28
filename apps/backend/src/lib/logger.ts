// src/lib/logger.ts
import pino from 'pino'
import type { Env } from '../config/env'

export function createLogger(env: Env) {
  return pino({
    level: env.LOG_LEVEL,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  })
}

export type Logger = ReturnType<typeof createLogger>
