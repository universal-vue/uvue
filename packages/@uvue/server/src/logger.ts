import * as pino from 'pino';
import 'pino-pretty';

export const logger = pino({
  prettyPrint: process.env.NODE_ENV !== 'production',
});
