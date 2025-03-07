const { sequelize } = require('../models/user');

const INITIAL_BALANCE = 10000;

beforeEach(async () => {
  await sequelize.sync({ force: true });
  
  await sequelize.query(`
    INSERT INTO users (id, balance, "createdAt", "updatedAt")
    VALUES (1, :balance, NOW(), NOW())
  `, {
    replacements: { balance: INITIAL_BALANCE }
  });
}, 10000); 

afterAll(async () => {
  await sequelize.close();
}); 