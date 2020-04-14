FROM node

WORKDIR /abcd

RUN npm install 

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]