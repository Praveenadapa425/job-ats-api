// File: src/models/Job.js (Corrected and Final Version)


module.exports = (sequelize, DataTypes) => {
  // We define the model inside this function
  const Job = sequelize.define('Job', {
    // Primary Key
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // Job Title
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Detailed job description
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Status to track if the job is open for applications
    status: {
      type: DataTypes.ENUM('open', 'closed'),
      allowNull: false,
      defaultValue: 'open',
    },
    // The `companyId` foreign key will be added automatically by the associations
    // defined in `src/models/index.js`
  }, {
    // Sequelize options
    timestamps: true, // Automatically add createdAt and updatedAt columns
  });

  // The function returns the initialized model
  return Job;
};