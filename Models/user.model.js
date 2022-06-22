const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName:{
        type: String,
        required:true,
    },
    lastName:{
        type: String,
        required:true,
    },
    phone:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    emailVerified:String,
    emailVerifyToken:String,
    assets:[{
        type: Schema.Types.ObjectId,
        ref: 'Stock'
    }],
    resetToken:{
        type: String},
    resetTokenExpiration: {
        type:Date
    }

});

module.exports = mongoose.model('User',userSchema)