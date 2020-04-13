require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const DATABASE_URL = 'mongodb://mongo:27017/node'
const app = express();

const bodyParser = require('body-parser');

const password = require('passport');

const server = require('http').createServer();
const io = require('socket.io')(server);

const multer = require('multer');
const graphqlHttp  = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');


mongoose.connect(DATABASE_URL);
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())

app.use('/graphql', graphqlHttp({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
}));

const subscribersRouter = require('./routes/subscribers')
app.use('/subscribers', subscribersRouter)

app.get('/', function(req,res){
  res.send('helo dawidek123)')
})

app.listen(3000, () => console.log('Server Started'))