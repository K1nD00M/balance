FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .
EXPOSE ${PORT}

CMD npm run migrate && npm start 