require("dotenv").config(); // Make sure to load the .env variables

const env = process.env.NODE_ENV || "development"; // Default to "development" if not specified

// Default configuration for each environment
const config = {
  development: {
    username: process.env.DB_USER || "root", // Example: "root" is a fallback
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || "my_database",
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql", // or "postgres", "sqlite", "mariadb", etc.
    logging: console.log, // Optional: for logging queries in development
    use_env_variable: process.env.DB_URL || null, // Use DATABASE_URL if available
  },
  test: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || "test_database",
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false, // Disable logging in tests
    use_env_variable: process.env.DB_URL || null,
  },
  production: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || "production_database",
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false, // Disable logging in production
    use_env_variable: process.env.DB_URL || null,
  },
};

// Export the configuration for the current environment
module.exports = config[env];
