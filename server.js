require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const DATABASE_URL = 'mongodb://mongo:27017/node'
const app = express()


mongoose.connect(DATABASE_URL);
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())

const subscribersRouter = require('./routes/subscribers')
app.use('/subscribers', subscribersRouter)

app.get('/', function(req,res){
  res.send('helo dawidek)')
})

app.listen(3000, () => console.log('Server Started'))