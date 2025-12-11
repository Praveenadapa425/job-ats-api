// File: src/server.js (Corrected and Final Version)

const app = require('./app');

// Import the entire db object from the central models/index.js file.
// This object contains all initialized models and the sequelize instance.
const db = require('./models');

// Load environment variables from the .env file
require('dotenv').config();

// Use the PORT from environment variables, or default to 3000
const PORT = process.env.PORT || 3000;

// An async function to start the server, allowing us to use 'await'
const startServer = async () => {
  try {
    // We now use `db.sequelize` to connect and sync the database.
    // This ensures we are using the same instance that all our models were defined with.
    // The `alter: true` option is suitable for development, as it will
    // attempt to update the database tables to match your model definitions
    // without dropping the table.
    await db.sequelize.sync({ alter: true });
    console.log('Database & tables have been successfully synced.');

    // Once the database is ready, start the Express server to listen for requests.
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    // If the database connection or sync fails, log the error and exit.
    console.error('Unable to sync database:', error);
    process.exit(1); // Exit the process with an error code
  }
};

// Call the function to start the server.
startServer();