const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri) {
      try {
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 4000,
        });
        console.log(`[MongoDB] Connected to configured URI: ${conn.connection.host}`);
        return conn;
      } catch (err) {
        console.warn(`[MongoDB] Failed to connect to ${mongoUri}: ${err.message}`);
        console.log(`[MongoDB] Falling back to MongoDB Memory Server...`);
      }
    }

    // Fallback to in-memory MongoDB for local development/zero-friction evaluation
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'multivendor_db'
      }
    });
    const memoryUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[MongoDB] In-Memory Server started & connected at: ${memoryUri}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (error) {
    console.error(`[MongoDB] Disconnect error: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
