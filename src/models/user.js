const { Model } = require('sequelize');
const sequelize = require('../configs/sequelize');
const userSchema = require('../schemas/userSchema');

class User extends Model {}

User.init(userSchema, {
  sequelize,
  modelName: 'User',
  tableName: 'users'
});

module.exports = User; 