import { buildGateway } from './gateway.js';

const app = buildGateway({ dataFile: new URL('../.data/gateway.json', import.meta.url).pathname });
await app.listen({ port: Number(process.env.PAYMENTS_PORT ?? 3001), host: '0.0.0.0' });
