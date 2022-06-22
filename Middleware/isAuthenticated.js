const jwt = require('jsonwebtoken');
require('dotenv').config();


module.exports = async (req,res,next) =>{
    const authHeader = req.get('Authorization')
    if(!authHeader){
        return res.status(401).json({message:'Authorization Error'})
    }

    const token = req.headers.authorization
    // const token = req.cookies.token
    let decodedToken
    if(!token){
        return res.status(401).json({message:'Authentication Invalid'})
    }

    try {
        // decodedToken =  jwt.verify(token,process.env.SECRET_KEY)
        decodedToken =  jwt.verify(token.slice(7),process.env.SECRET_KEY)

        
        
    } catch (error) {
        return res.status(500).json({message:'Not Authorized'})
        
    }
   

    if(!decodedToken){
        return res.status(401).json({message:'Problem Authorizing the request'})
    }else{
        req.user = decodedToken;
        next()
    }
}
