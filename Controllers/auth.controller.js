const User = require('../Models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const crypto = require('crypto');
const aws = require('aws-sdk')
aws.config.update({
    secretAccessKey: process.env.SECRET_KEY_AWS,
    accessKeyId: process.env.ACCESS_KEY_AWS,
    region:process.env.REGION_AWS
})

exports.signUp = async (req, res, next) => {
    const { firstName, phone, password, email, lastName } = req.body.data
    try {
        const hashedPassword = await bcrypt.hash(password, 12)

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
        res.status(200).json({ message: 'user created successfully' })
    } catch (error) {
        res.staus(400).json({ error: error.message })
    }
}


exports.login = async (req, res, next) => {
    const { email, password } = req.body
    let loadedUser
    try {
        const user = await User.findOne({ email: email })

        if (!user) {
            const error = new Error('Wrong email or password')
            error.status = 401;
            throw error
        }

        loadedUser = user
        result = await bcrypt.compare(password, user.password)

        if (!result) {
            const error = new Error('Wrong email or Password')
            error.status = 401;
            throw error
        }


        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString(),
            name: loadedUser.firstName
        }, process.env.SECRET_KEY,
            { expiresIn: '1h' }
        )

        const decodedToken = jwt.decode(token)
        const expiresAt = decodedToken.exp

        // res.cookie('token', token, {
        //     httpOnly: true
        // })

        res.status(200).json({
            token: token,
            userInfo: {
                userId: loadedUser._id.toString(),
                email: loadedUser.email
            },
            name: loadedUser.firstName,
            expiresAt: expiresAt
        })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }


}

exports.resetPassword = async (req, res, next) => {
    const email = req.body.email
    try {
        const user = await User.findOne({ email: email })
        if (!user) {
            const error = new Error('User not found')
            error.status = 404;
            throw error
        }

        const token = await new Promise((resolve, reject) => {
            crypto.randomBytes(32, (error, buffer) => {
                if (error) {
                    reject(-1)
                }

                resolve(buffer.toString('hex'));
            })

        })

        if (!token) {
            res.status(404).json({ message: 'Could not process the request' })
        }


        user.resetToken = token
        user.resetTokenExpiration = Date.now() + 3600000

        await user.save()

        // Send Email
        const ses = new aws.SES()
        const name = user.firstName
        const link = `http://localhost:3000/newpassword/${token}`
        const from_mail = 'dasarug@gmail.com'
        const to_mail = email

        await ses.sendTemplatedEmail({
            Source: from_mail,
            Destination: {
                ToAddresses: [to_mail],
            },
            Template: "AWS-PASSWORD_RECOVERY_TEMPLATE_FINTRACK",
            TemplateData: "{\"user\":\"" + name + "\",\"link\":\"" + link + "\"}"
        }).promise()

    
        
        res.status(200).json({ message: 'Success' })

    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

exports.changePassword = async (req, res, next) => {
    const token = req.params.token
    try {
        const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        if (!user) {
            const error = new Error('User not found')
            error.status = 404;
            throw error
        }

        res.status(200).json({ message: 'Please Provide a new password', data: { user: user._id, token } })

    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

exports.newPassword = async (req, res, next) => {
    const { id, token, newPassword } = req.body.data
    try {
        const user = await User.findOne({ _id: id, resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        if (!user) {
            const error = new Error('User Not found')
            error.status = 404
            throw error
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12)

        user.password = hashedPassword
        user.resetToken = undefined
        user.resetTokenExpiration = undefined

        await user.save()

        res.status(200).json({ message: 'Pasword Updated Successfully' })

    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}
