// File: src/models/index.js (Corrected and Final)

const { sequelize, DataTypes } = require('../config/database');

const db = {};

// Initialize all models and store them in the db object
db.User = require('./User')(sequelize, DataTypes);
db.Company = require('./Company')(sequelize, DataTypes);
db.Job = require('./Job')(sequelize, DataTypes);
db.Application = require('./Application')(sequelize, DataTypes);
db.ApplicationHistory = require('./ApplicationHistory')(sequelize, DataTypes);

// --- Define Relationships (Associations) ---
// This part remains the same, but we use the models from the db object
db.Company.hasMany(db.User, { foreignKey: 'companyId', constraints: false });
db.User.belongsTo(db.Company, { foreignKey: 'companyId' });

db.Company.hasMany(db.Job, { foreignKey: { name: 'companyId', allowNull: false } });
db.Job.belongsTo(db.Company, { foreignKey: { name: 'companyId', allowNull: false } });

db.Job.hasMany(db.Application, { foreignKey: { name: 'jobId', allowNull: false } });
db.Application.belongsTo(db.Job, { foreignKey: { name: 'jobId', allowNull: false } });

db.User.hasMany(db.Application, { foreignKey: { name: 'candidateId', allowNull: false } });
db.Application.belongsTo(db.User, { as: 'candidate', foreignKey: { name: 'candidateId', allowNull: false } });

db.Application.hasMany(db.ApplicationHistory, { foreignKey: { name: 'applicationId', allowNull: false } });
db.ApplicationHistory.belongsTo(db.Application, { foreignKey: { name: 'applicationId', allowNull: false } });

db.User.hasMany(db.ApplicationHistory, { foreignKey: { name: 'changedById', allowNull: false } });
db.ApplicationHistory.belongsTo(db.User, { as: 'changedBy', foreignKey: { name: 'changedById', allowNull: false } });

// Add the sequelize instance to the db object
db.sequelize = sequelize;

module.exports = db;