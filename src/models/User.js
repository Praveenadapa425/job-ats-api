

const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'This email address is already in use.' },
      validate: { isEmail: { msg: 'Please enter a valid email address.' } },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('candidate', 'recruiter', 'hiring_manager'), allowNull: false },
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
    timestamps: true,
  });

  return User;
};