import fastify from 'fastify'
import { join } from 'path';

require('dotenv').config({ path: join(__dirname, '../config.conf') })

const app = fastify({
  logger: {
    transport:
      process.env.NODE_ENV === 'development'
        ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
            colorize: true
          }
        }
        : undefined
  }
})

// Plugins
app.register(require('@fastify/formbody'))
app.register(require('@fastify/cors'), {
  origin: ['https://r7.moph.go.th'],
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
})

// Rate limit
app.register(import('@fastify/rate-limit'), {
  global: true,
  max: 100,
  ban: 3,
  timeWindow: '10m', // 1h
  keyGenerator: (request: any) => {
    return request.headers['x-real-ip'];
  }
})

app.register(require('@fastify/redis'), {
  host: process.env.REDIS_HOST || '127.0.0.1',
  password: process.env.REDIS_PASSWORD || '',
})

// Database
app.register(require('./plugins/db'), {
  options: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'test',
      port: Number(process.env.DB_PORT) || 3306,
      password: process.env.DB_PASSWORD || 'test',
      database: process.env.DB_NAME || 'test',
    },
    pool: {
      min: 2,
      max: 100
    },
    debug: process.env.NODE_ENV === "DEVELOPMENT" ? true : false,
  }
})

// JWT
app.register(require('./plugins/jwt'), {
  secret: process.env.SECRET_KEY || '@1234567890@',
  sign: {
    iss: 'example.com',
    expiresIn: '1d'
  },
  messages: {
    badRequestErrorMessage: 'Format is Authorization: Bearer [token]',
    noAuthorizationInHeaderMessage: 'Autorization header is missing!',
    authorizationTokenExpiredMessage: 'Authorization token expired',
    authorizationTokenInvalid: (err: any) => {
      return `Authorization token is invalid: ${err.message}`
    }
  }
})

app.register(require('fastify-axios'), {
  timeout: 60000
})

// routes
app.register(require("./routes/health_check"), { prefix: '/health-check' })
app.register(require("./routes/welcome"), { prefix: '/' })
app.register(require("./routes/resources"), { prefix: '/resources' })
app.register(require("./routes/schema"), { prefix: '/schema' })

export default app;
