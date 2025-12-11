// File: src/models/ApplicationHistory.js 

module.exports = (sequelize, DataTypes) => {
  // We define the model inside this function
  const ApplicationHistory = sequelize.define('ApplicationHistory', {
    // Primary Key
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // We store the stages as strings for a clear, human-readable log
    previousStage: {
      type: DataTypes.STRING,
      allowNull: true, // The first entry ('Applied') has no previous stage
    },
    newStage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // `applicationId` and `changedById` foreign keys will be added automatically
    // by the associations in `src/models/index.js`
  }, {
    // Sequelize options
    timestamps: true,   // The `createdAt` field serves as our timestamp for the change
    updatedAt: false,   // We don't need to track updates to this log
  });

  // The function returns the initialized model
  return ApplicationHistory;
};