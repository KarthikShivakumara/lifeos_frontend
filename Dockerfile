FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 3000

RUN npm run build

CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
