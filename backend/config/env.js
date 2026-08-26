require("dotenv").config({ path: "../.env" });

module.exports = {
  port: process.env.PORT || 3000,
  dbHost: process.env.DB_HOST || "localhost",
  dbPort: process.env.DB_PORT || 5432,
  dbUser: process.env.DB_USER || "credtrust",
  dbPassword: process.env.DB_PASSWORD || "CredTrust@123",
  dbName: process.env.DB_NAME || "credtrust_dev",
  jwtSecret: process.env.JWT_SECRET || "super_secret_jwt_key_for_demo_only",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  nodeEnv: process.env.NODE_ENV || "development"
};
