const http = require('http');
const app = require('./app');
const config = require('./config/env');
const { logger, configureLogger } = require('./utils/logger');
const { connectDatabase, connectAuthDatabase } = require('./config/database');

const server = http.createServer(app);

const start = async () => {
  try {
    configureLogger(config.logLevel);
    await connectDatabase();
    await connectAuthDatabase();

    server.listen(config.port, () => {
      logger.info(`Server listening on port ${config.port}`);
    });
  } catch (error) {
    logger.fatal('Server startup failed', error);
    process.exit(1);
  }
};

start();

const gracefulShutdown = (signal) => {
  process.on(signal, () => {
    logger.info(`${signal} received. Closing server.`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });
};

['SIGTERM', 'SIGINT'].forEach(gracefulShutdown);

const normalizeError = (payload) => (payload instanceof Error ? payload : new Error(String(payload)));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection detected', normalizeError(reason));
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.fatal('Uncaught exception detected', error);
  process.exit(1);
});
