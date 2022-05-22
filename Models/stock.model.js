const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const stockSchema = new Schema({
    name:{
        type: String,
        required:true
    },
    ticker: {
        type: String,
        required:true
    },
    date:{
        type:Date,
        default: Date.now
    },
    numOfShares:{
        type: Number,
        required: true
    },
    entryPrice:{
        type:Number,
        required:true
    },
    typeOfAsset:{
        type:String,
        required:true
    },
    name_alpha:{
        type:String,
        required:true
    }

});

module.exports = mongoose.model('Stock', stockSchema);