const User = require('../Models/user.model');
const bcrypt = require ('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();


exports.signUp = async (req,res,next)=>{
    const {firstName,phone,password,email,lastName} = req.body.data
    try {    
        const hashedPassword = await bcrypt.hash(password,12)

        const userData = {
            email: email.toLowerCase(),
            firstName,
            lastName,
            phone,
            password: hashedPassword,
            };
  
        const existingEmail = await User.findOne({
        email: userData.email
        }).lean();
  
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const user = new User(userData)
        const result = await user.save()
        res.status(200).json({message:'user created successfully'})
    } catch (error) {
        res.staus(400).json({error:error.message})
    }
}


exports.login = async (req,res,next)=>{
    const {email,password} = req.body
    let loadedUser 
    try {
        const user = await User.findOne({email:email})

        if(!user){
            const error = new Error('Wrong email or password')
            error.status = 401;
            throw error
        }

        loadedUser = user
        result = bcrypt.compare(password,user.password)

        if(!result){
            const error = new Error('Wrong email or Password')
            error.status = 401;
            throw error
        }


        const token = jwt.sign({
            email:loadedUser.email,
            userId: loadedUser._id.toString(),
            name: loadedUser.firstName
            },process.env.SECRET_KEY,
            {expiresIn:'1h'}
            )
        
        const decodedToken = jwt.decode(token)
        const expiresAt = decodedToken.exp

        res.cookie('token',token,{
            httpOnly:true
        })

        res.status(200).json({token:token,
                            userInfo:{
                                userId: loadedUser._id.toString(),
                                email:loadedUser.email},
                                name: loadedUser.firstName,
                            expiresAt:expiresAt})
        
    } catch (error) {
        res.status(400).json({message:error.message})
    }


}