require('dotenv').config()
const app = require('../app')
const config = require('../config')
const { sequelize } = require('../config/database')
const logger = require('../config/logger')


const PORT = config.server.port

const startServer = async () => {
    try {
        // DB Connection verification
        await sequelize.authenticate();
        logger.info('Database connected successfully.')
        app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT} [${config.server.env}]`);
        });
    } catch (err) {
        logger.error('❌ Failed to start server:', err);
        process.exit(1);
    }
}

// Shutdown
const shutDown = async (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    await sequelize.close();
    process.exit();
}

process.on('SIGTERM', () => shutDown('SIGTERM'));
process.on('SIGINT', () => shutDown('SIGINT'));
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

startServer();