export const config = {
  port: Number(process.env.API_PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://telon:telon@localhost:5432/telon',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  paymentsUrl: process.env.PAYMENTS_URL ?? 'http://localhost:3001',
  ticketsSecret: process.env.TICKETS_SECRET ?? 'telon-dev-solo-para-el-curso',
  holdMinutes: 10,
};
