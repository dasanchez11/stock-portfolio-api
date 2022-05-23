require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser')


// APP INITIALIZATION AND CONFIGURATION
const app = express();
app.use(bodyParser.json());
app.use(cors())
app.use(cookieParser())


app.use((req,res,next)=> {
    // res.setHeader('Access-Control-Allow-Origin', "http://localhost:3000")
    res.setHeader('Access-Control-Allow-Origin', "https://peppy-duckanoo-789c6c.netlify.app")
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next()
})

const stockRoutes = require('./Routes/stock.routes')
const authRoutes = require('./Routes/auth.routes')

app.use('/stock',stockRoutes)
app.use('/auth',authRoutes)



mongoose.connect(process.env.MONGO_DB_URL)
    .then(res=>{
        const server = app.listen(process.env.PORT)
        console.log('app running on port',process.env.PORT)
    }).catch(error=>{
        console.log(error)
    })
  




