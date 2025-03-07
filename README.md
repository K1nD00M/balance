Для связи: https://t.me/DmitryDurnikin

## Технологии
- Node.js
- Express
- PostgreSQL
- Sequelize
- Jest
- Docker
- Docker Compose

## Установка и запуск
1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd balance
```

2. Создайте файл .env на основе примера (или используйте значения по умолчанию):
```bash
cp .env.example .env
```

3. Запустите приложение с помощью Docker Compose:
```bash
docker-compose up --build
```

Приложение будет доступно по адресу: http://localhost:3000


Для разработки без Docker можно использовать следующие команды:
1. Установите зависимости:
```bash
npm install
```

2. Настройте базу данных в .env

3. Запустите миграции:
```bash
npm run migrate
```

4. Запустите приложение:
```bash
npm start
```

## Конфигурация
Все настройки приложения находятся в файле `.env`:

- `NODE_ENV` - окружение (development/production)
- `PORT` - порт приложения внутри контейнера
- `DOCKER_APP_PORT` - порт приложения на хосте
- `DOCKER_DB_PORT` - порт базы данных на хосте
- `DB_*` - настройки подключения к базе данных

## API Endpoints

### Получение баланса
```http
GET /api/balance/:userId
```

### Изменение баланса
```http
POST /api/balance/update
```

Тело запроса:
```json
{
  "userId": 1,
  "amount": 100,
  "type": "withdraw" // "deposit"
}
```

## Тестирование
```bash
npm test
``` 