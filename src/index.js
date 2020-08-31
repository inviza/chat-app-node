// const server = require('./app')
// const port = process.env.PORT || 3000



// // app.get('/weather', (req,res) => {
// //     res.send('weather')
// // })


// server.listen(port, () => {
//     console.log('Server is up on port',port)
// })




const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

let count = 0

io.on('connection', (socket) => {
    // console.log('New WebSocket connection')

    // socket
    // socket.emit('countUpdated', count)

    // socket.on('increment', () => {
    //     count++
    //     io.emit('countUpdated', count)
    // })

    

    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id: socket.id, ...options})
       
        if(error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('Admin', 'Welkome'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has join`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users:getUserInRoom(user.room)
        })
        callback()

        // socket.emit io.emit socket.broadcast.emit
        // io.to.emit socket.broadcast.to.emit
    })

    socket.on('sendMessage', (txt, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(txt)) {
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username,txt))
        callback('Delivered!')
    })

    

    socket.on('sendLocation', (position, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage( user.username,position.lat, position.long))
        callback()
    })    

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users:getUserInRoom(user.room)
            })
        }
    }) 
})



server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})