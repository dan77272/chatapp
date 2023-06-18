const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const ws = require('ws')
const bcrypt = require('bcrypt');

const app = express()
app.use(express.json())
const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200,
    credentials: true,
    
}
app.use(cors(corsOptions))
app.use(cookieParser())
const User = require('./models/User')
const Message = require('./models/Message')
app.get('/test', (req, res) => {
    res.json('test')
})

app.get('/profile', (req, res) => {
    const token = req.cookies.token
    if(token){
        jwt.verify(token, process.env.JWT_SECRET, (err, userData) => {
            if(err) throw err
            res.json(userData)
        })
    }else{
        res.status(401).json('no token')
    }
})

app.get('/messages/:userId', async (req, res) => {
    const data = req.params;
    const token = req.headers.cookie.split('=')[1];
    if (token) {
      try {
        const userData = jwt.verify(token, process.env.JWT_SECRET);
        const { userId, username } = userData;
        const messages = await Message.find({
          $or: [
            { sender: userId, recipient: data.userId }, // Messages sent by the user
            { sender: data.userId, recipient: userId }, // Messages received by the user
          ]
        }).exec();
        res.json(messages);
      } catch (err) {
        throw err;
      }
    }
  });

app.post('/login', async (req, res) => {
    const {username, password} = req.body
    const foundUser = await User.findOne({username})
    if(foundUser){
        const checkPassword = bcrypt.compareSync(password, foundUser.password)
        if(checkPassword){
            jwt.sign({userId: foundUser._id, username}, process.env.JWT_SECRET, (err, token) => {
                if(err) throw err
                res.cookie('token', token).status(201).json({
                    id: foundUser._id
                })
            })
        }
        else{
            res.status(409).json({error: "Wrong Username/Password"})
        }
    }
    else{
        res.status(409).json({error: "Wrong Username/Password"})
    }
})

app.post('/register', async (req, res) => {
    const {username, password} = req.body
    const hashedPassword = bcrypt.hashSync(password, 10)
    const existingUser = await User.findOne({username})
    if(existingUser){
        res.status(409).json({error: "Username already exists"})
    }
    else{    
            const createdUser = await User.create({
            username: username,
            password: hashedPassword
        })
        jwt.sign({userId: createdUser._id, username}, process.env.JWT_SECRET, (err, token) => {
            if(err) throw err
            res.cookie('token', token).status(201).json({
                id: createdUser._id
            })
        })
    }

    
})

app.post('/logout', async (req, res) => {
    res.cookie('token', '').json('ok')
})

mongoose.connect(process.env.MONGO_DB)


const server = app.listen(3001, () => {
    console.log('Listening...')
})

const wss = new ws.WebSocketServer({server})

wss.on('connection', (connection, req) => {
    const cookie = req.headers.cookie
    console.log(cookie)
    if(cookie){
        const token = cookie.split('=')[1]
        if(token){
            jwt.verify(token, process.env.JWT_SECRET, (err, userData) => {
                if(err) throw err
                const {userId, username} = userData
                connection.userId = userId
                connection.username = username
            })
        }

        connection.on('message', async (message) => {
            const messageData = JSON.parse(message.toString())
            const {recipient, text} = messageData
            // console.log(messageData)
            const createdMessage = await Message.create({
                sender: connection.userId,
                recipient,
                text
            })
            if(recipient && text){
                [...wss.clients].filter(c => c.userId === recipient).forEach((c) => c.send(JSON.stringify({ _id: createdMessage._id, sender: connection.userId, recipient, text })));
            }

        })

    }
    [...wss.clients].forEach(client => {
        client.send(JSON.stringify({
            online: [...wss.clients].map(c => ({userId: c.userId, username: c.username}))
        }))
    })
})