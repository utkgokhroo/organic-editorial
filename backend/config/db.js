const mongoose = require("mongoose");

/**
 * Connect to MongoDB.
 *
 * In DEVELOPMENT: if MongoDB is unavailable the server keeps running
 * (routes that need the DB will return 503). This lets the frontend
 * load products from its local-data fallback without the whole backend
 * dying.
 *
 * In PRODUCTION: a failed initial connection is treated as fatal and
 * the process exits so the process manager (PM2 / k8s) can restart it.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000, // give up trying to connect after 5 s
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // ── Post-connect event handlers ────────────────────
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
    });

    mongoose.connection.on("error", (err) => {
      console.error(`❌ MongoDB error: ${err.message}`);
    });
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);

    if (process.env.NODE_ENV === "production") {
      // In production, a missing DB is unrecoverable at startup — exit so the
      // process manager can restart with back-off.
      process.exit(1);
    } else {
      // In development, log clearly and continue so the developer can still
      // start the server and see the frontend via local-data fallback.
      console.warn(
        "⚠️  Running WITHOUT a database. API routes requiring MongoDB will return 503.\n" +
        "   Start MongoDB or seed the DB to enable full functionality."
      );
    }
  }
};

module.exports = connectDB;
