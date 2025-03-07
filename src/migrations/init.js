const userSchema = require('../schemas/userSchema');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('users', userSchema);

    // Добавляем ограничение на неотрицательный баланс
    await queryInterface.sequelize.query(
      'ALTER TABLE users ADD CONSTRAINT check_balance_non_negative CHECK (balance >= 0)'
    );

    await queryInterface.bulkInsert('users', [{
      balance: 10000,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  }
}; 