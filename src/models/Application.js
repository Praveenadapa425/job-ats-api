// File: src/models/Application.js 

module.exports = (sequelize, DataTypes) => {
  // We define the model inside this function
  const Application = sequelize.define('Application', {
    // Primary Key
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // This field is the heart of our state machine
    stage: {
      type: DataTypes.ENUM(
        'Applied',
        'Screening',
        'Interview',
        'Offer',
        'Hired',
        'Rejected'
      ),
      allowNull: false,
      defaultValue: 'Applied',
    },
    // `jobId` and `candidateId` foreign keys will be added automatically
    // by the associations in `src/models/index.js`
  }, {
    // Sequelize options
    timestamps: true, // Automatically add createdAt and updatedAt columns
  });

  // The function returns the initialized model
  return Application;
};