const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);

io.on('connect', socket => {})
io.on('connection', socket => {
  let roomId

  socket.on('join', data => {
    roomId = data.roomId
    if (roomId) {
      socket.join(roomId)
      const room = io.sockets.adapter.rooms[roomId];
      socket.emit('join', room)
      socket.broadcast.to(roomId).emit('bc_join', room)
    }
  })

  socket.on('update_code', data => {
    if (roomId) {
      const { code } = data
      socket.broadcast.to(roomId).emit('update_code', { code })
    }
  })

  socket.on('disconnect', function() {
    if (roomId) {
      const room = io.sockets.adapter.rooms[roomId];
      socket.emit('join', room)
      socket.broadcast.to(roomId).emit('bc_join', room)
    }
  })
})

server.listen(process.env.PORT || 5000, () => console.log(`Server has started.`));