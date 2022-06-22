const axios = require('axios')
require('dotenv').config();
const User = require('../Models/user.model')
const Stock = require('../Models/stock.model')
const fs = require('fs');
var path = require('path')


let rawdata = fs.readFileSync(path.join(__dirname,'../Assets/availablePairs.json'));
let rawCols = fs.readFileSync(path.join(__dirname,'../Assets/availableStocks.json'));
let stocks = JSON.parse(rawdata);
let value = JSON.parse(rawCols);




const utils = require('./utils')
const mongoose = require('mongoose')




// GET data on a specific stock
exports.getStock  = async (req,res,next) =>{
    const {tickerName,interval} = req.body
    try {
        const results = await axios.get(`https://api.twelvedata.com/time_series?apikey=${process.env.API_KEY}&interval=${interval}&symbol=${tickerName}&format=JSON`)
        const {values} = results.data
        res.status(200).json({message:'Success getting stock',data:values})
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}




// POST add stock to user
exports.addStock = async (req,res,next) =>{
    const {userId} = req.user
    const {name,ticker,typeOfAsset,addValues,name_alpha} = req.body.data
    let {entryPrice,numOfShares} = addValues
    try {
        if(!numOfShares){
            const error = new Error('Number of Shares Must be defined')
            error.status = 401;
            throw error
        }
        const user = await User.findById(userId)
        if(!user){
            const error = new Error('User with this email could not be found')
            error.status = 401;
            throw error
            
        }
        
        const result = await utils.getTickerPrice(ticker,'1h',8)
        const price = result.values[0].close

        if(entryPrice===''){
            entryPrice = price
        }
        
        const stock = new Stock({
            name:name,
            ticker:ticker,
            numOfShares:numOfShares,
            entryPrice:entryPrice,
            typeOfAsset:typeOfAsset,
            name_alpha:name_alpha
        })



        const results = await stock.save()
        user.assets.push(stock)
        await user.save()
        let sendData = results.toObject()
        sendData = {...sendData,'price':price}

        const histData = {result}


        res.status(200).json({message:'Stock Added Successfully',data:sendData,histData:histData})

    } catch (error) {
        res.status(400).json({message:error.message})
    }
}

exports.findStocks = async (req,res,next) =>{
    const {userId} = req.user
    try {
        const user = await User.findById(userId)

        if(!user){
            const error = new Error('User with this email could not be found')
            error.status = 401;
            throw error
        }

        const assets = user.assets
        let assetsList = []
        const tickers = await Stock.find({_id:{$in:assets}}).distinct('ticker')
        const pricesFetch = await utils.getTickerPrice(tickers,'1h',8)

        let variable ={}
        if(assets.length===1){
            variable[tickers] = pricesFetch 
        }else{
            variable = pricesFetch
        }

        await Promise.all( assets.map(async asset =>{
            const stock = await Stock.findById(asset._id)
            
            
            const data = {
                _id:stock._id,
                name:stock.name,
                ticker:stock.ticker,
                numOfShares:stock.numOfShares,
                entryPrice:stock.entryPrice,
                typeOfAsset:stock.typeOfAsset,
                date: stock.date,
                price:variable[stock.ticker].values[0].close,
                name_alpha:stock.name_alpha
            }

            assetsList.push(data)
        }))

        
        
        res.status(200).json({message:'data found',data:assetsList,histData:pricesFetch})

    } catch (error) {
        res.status(400).json({message:error.message})
    }
}


exports.removeStock = async (req,res,next) =>{
    const {id} = req.body
    const {userId} = req.user
    
    try {
        const result = await Stock.deleteMany({_id:id})
        const user = await User.findById(userId)

        if(!user){
            res.status(401).json({message:'Invalid User'})
        }

        user.assets.pull(id)
        await user.save()

        res.status(200).json({message:'removed successfuly'})
    } catch (error) {
        res.status(401).json({message:error.message})
    }
}

exports.editStock = async (req,res,next) =>{
    const {id,data} = req.body.data
    const {entryPrice,numOfShares} = data
  
    try {
        const result = await Stock.findByIdAndUpdate(id,{entryPrice:entryPrice,numOfShares:numOfShares})
        res.status(200).json({message:'updated successfuly'})
    } catch (error) {
        res.status(401).json({message:error.message})
    }
}


exports.searchStock = async (req,res,next) =>{
    const {query} = req.body.data
    let result = utils.getQueryResult(query,stocks,value)
    if (result.length>20){
        result = result.slice(0, 20)
    }

    res.status(200).json({message:'Found',data:result})
  
}
