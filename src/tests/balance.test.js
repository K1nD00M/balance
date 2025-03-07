const request = require('supertest');
const app = require('../app');
const { OPERATION_TYPES } = require('../validators/balanceValidator');
const { sequelize } = require('../models/user');

const INITIAL_BALANCE = 10000;

async function resetDatabase() {
  await sequelize.query('TRUNCATE TABLE users RESTART IDENTITY');
  await sequelize.query(
    `INSERT INTO users (id, balance, "createdAt", "updatedAt")
     VALUES (1, :balance, NOW(), NOW())`,
    {
      replacements: { balance: INITIAL_BALANCE }
    }
  );
}

describe('Balance API', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  describe('POST /api/balance/update', () => {
    describe('Validation', () => {
      it('should return 400 when userId is missing', async () => {
        const response = await request(app)
          .post('/api/balance/update')
          .send({
            amount: 100,
            type: OPERATION_TYPES.DEPOSIT
          });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          success: false,
          status: 'fail',
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'userId',
              message: 'User ID is required'
            })
          ])
        });
      });

      it('should return 400 when amount is negative', async () => {
        const response = await request(app)
          .post('/api/balance/update')
          .send({
            userId: 1,
            amount: -100,
            type: OPERATION_TYPES.DEPOSIT
          });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          success: false,
          status: 'fail',
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'amount',
              message: 'Amount must be positive'
            })
          ])
        });
      });

      it('should return 400 when amount is not an integer', async () => {
        const response = await request(app)
          .post('/api/balance/update')
          .send({
            userId: 1,
            amount: 100.5,
            type: OPERATION_TYPES.DEPOSIT
          });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          success: false,
          status: 'fail',
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'amount',
              message: 'Amount must be an integer'
            })
          ])
        });
      });

      it('should return 400 when type is invalid', async () => {
        const response = await request(app)
          .post('/api/balance/update')
          .send({
            userId: 1,
            amount: 100,
            type: 'invalid'
          });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          success: false,
          status: 'fail',
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'type',
              message: 'Operation type must be either deposit or withdraw'
            })
          ])
        });
      });
    });

    describe('Business Logic', () => {
      it('should successfully deposit money', async () => {
        const depositAmount = 100;
        const response = await request(app)
          .post('/api/balance/update')
          .send({
            userId: 1,
            amount: depositAmount,
            type: OPERATION_TYPES.DEPOSIT
          });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          success: true,
          data: {
            userId: 1,
            balance: INITIAL_BALANCE + depositAmount,
            operation: {
              type: OPERATION_TYPES.DEPOSIT,
              amount: depositAmount
            }
          }
        });

        const balanceResponse = await request(app).get('/api/balance/1');
        expect(balanceResponse.body.data.balance).toBe(INITIAL_BALANCE + depositAmount);
      });

      it('should successfully withdraw money', async () => {
        const withdrawAmount = 50;
        const response = await request(app)
          .post('/api/balance/update')
          .send({
            userId: 1,
            amount: withdrawAmount,
            type: OPERATION_TYPES.WITHDRAW
          });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          success: true,
          data: {
            userId: 1,
            balance: INITIAL_BALANCE - withdrawAmount,
            operation: {
              type: OPERATION_TYPES.WITHDRAW,
              amount: withdrawAmount
            }
          }
        });

        const balanceResponse = await request(app).get('/api/balance/1');
        expect(balanceResponse.body.data.balance).toBe(INITIAL_BALANCE - withdrawAmount);
      });

      it('should return 400 when trying to withdraw more than balance', async () => {
        const response = await request(app)
          .post('/api/balance/update')
          .send({
            userId: 1,
            amount: INITIAL_BALANCE + 1,
            type: OPERATION_TYPES.WITHDRAW
          });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          success: false,
          status: 'fail',
          message: 'Insufficient funds for this operation'
        });

        // Проверяем, что баланс не изменился
        const balanceResponse = await request(app).get('/api/balance/1');
        expect(balanceResponse.body.data.balance).toBe(INITIAL_BALANCE);
      });

      it('should return 404 when user does not exist', async () => {
        const response = await request(app)
          .post('/api/balance/update')
          .send({
            userId: 999,
            amount: 100,
            type: OPERATION_TYPES.DEPOSIT
          });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
          success: false,
          status: 'fail',
          message: 'User not found'
        });
      });

      it('should handle concurrent withdraw requests correctly', async () => {
        const TOTAL_REQUESTS = 5000;
        const AMOUNT_PER_REQUEST = 4;

        const requests = Array(TOTAL_REQUESTS).fill().map(() =>
          request(app)
            .post('/api/balance/update')
            .send({
              userId: 1,
              amount: AMOUNT_PER_REQUEST,
              type: OPERATION_TYPES.WITHDRAW
            })
        );

        const results = await Promise.all(requests);

        const successCount = results.filter(r => r.status === 200).length;
        const failCount = results.filter(r => r.status === 400).length;

        expect(successCount + failCount).toBe(TOTAL_REQUESTS);
        const balanceResponse = await request(app).get('/api/balance/1');
        const finalBalance = balanceResponse.body.data.balance;

        expect(finalBalance).toBe(INITIAL_BALANCE - (successCount * AMOUNT_PER_REQUEST));
        expect(finalBalance).toBeGreaterThanOrEqual(0);

        const expectedSuccessCount = Math.floor(INITIAL_BALANCE / AMOUNT_PER_REQUEST);
        expect(successCount).toBe(expectedSuccessCount);
      }, 60000);
    });
  });

  describe('GET /api/balance/:userId', () => {
    it('should return user balance', async () => {
      const response = await request(app)
        .get('/api/balance/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          userId: 1,
          balance: INITIAL_BALANCE
        }
      });
    });

    it('should return 404 when user does not exist', async () => {
      const response = await request(app)
        .get('/api/balance/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        status: 'fail',
        message: 'User not found'
      });
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });
}); 