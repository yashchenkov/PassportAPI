FROM node

WORKDIR /passport

COPY package*.json ./

RUN npm install

COPY ./ ./


EXPOSE 3000

CMD ["npm", "start"]