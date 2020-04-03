FROM node

WORKDIR /usr/src/app

COPY package.json .

RUN npm install nodemon -g

RUN npm install dotenv -g

COPY . .

EXPOSE 3000

CMD ["npm", "run", "devStart"]