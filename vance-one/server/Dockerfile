FROM node:22-alpine
WORKDIR /usr/src/app

COPY package.json package.json

RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production

EXPOSE 6666

CMD ["npm", "start"]
