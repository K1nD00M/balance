const express = require('express');
const balanceRoutes = require('./routes/balanceRoutes');
const { AppError } = require('./utils/errors');

const app = express();

app.use(express.json());

app.use('/api/balance', balanceRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use((err, req, res, next) => {
  const error = err instanceof AppError ? err : new AppError(err.message);
  res.status(error.statusCode).json(error.toJSON());
});

// Экспортируем приложение для тестов
module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} 