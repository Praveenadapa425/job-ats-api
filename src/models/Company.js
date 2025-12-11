// File: src/models/Company.js 

module.exports = (sequelize, DataTypes) => {
  // We define the model inside this function
  const Company = sequelize.define('Company', {
    // Primary Key
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // Company Name
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'A company with this name already exists.',
      },
    },
    // Optional company description
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    // Sequelize options
    timestamps: true, // Automatically add createdAt and updatedAt columns
  });

  // The function returns the initialized model
  return Company;
};