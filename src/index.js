///////////////////////// IMPORTS ////////////////////////////////////////////////
require('dotenv').config();
const path = require('path');

const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');
//const cors = require('cors');
const publicDirectoryPath = path.join(__dirname, '../public');






///////////////////// CONFIGURACIONES ///////////////////////////////////////////////////


const app = express();
const server = http.createServer(app);
const io = socketio(server);


////////////////////////// MIDDLEWARES /////////////////////////////////////////////////
//app.use(cors());

app.use(express.static(publicDirectoryPath));

//let count = 0;

///////////////////////////// SOCKET CONNECTION ////////////////////////////////////////////////////////////
// We start connection through the event (connection) and a callback function to execute. 'connection fires everytime socket io server gets a new connection'
io.on('connection', (socket) => {
  console.log('New Web Socket Connection');

  socket.on('join', ({ username, room }, callback) => {

    const {error, user } = addUser({ id: socket.id, username, room });
    
    if(error){
       return callback(error);
    }

    // Joining to a room  
   socket.join(user.room);

    // 3 ways to emit:

  // a) Emites to a specific user
  socket.emit('message', generateMessage('Admin','Welcome!'));

  // b)Emits everyone, except the broadcaster (socket)
  socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`));
  io.to(user.room).emit('roomData', {
     room:user.room,
     usersList:getUsersInRoom(user.room)
  });
  callback();
  });

 

  // On listening from clients
  socket.on('sendMessage', (message, callback) => {
     // Geting user info and sending message to the correct room
     const user = getUser(socket.id);

   const filter = new Filter();
   if(filter.isProfane(message)){
      return callback('profanity is not allowed!');
   }
     


  // c) Emits to everyone connected
      io.to(user.room).emit('message', generateMessage(user.username,message));
      callback();
   })
 
   
   ////////////////////// LISTENING LOCATION FROM CLIENTS ////////////////////////////////////////
   // Receiving coords from client
   socket.on('sendLocation', (coords, callback) => {


      const user = getUser(socket.id);

      // Emitin coords to all clients
      io.to(user.room).emit('coords', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
      callback();
   });


   ///////////////////////// DISCONNECTING FROM SOCKET //////////////////////////////////////////
   // We use the event 'disconnect' when a user disconnects
   socket.on('disconnect', () => {

      const user = removeUser(socket.id);

      if(user){

         io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`));
         io.to(user.room).emit('roomData',{
            room: user.room,
            usersList:getUsersInRoom(user.room)
         });
      }


   });
 
});















//////////////////////////// LEVANTAR EL SERVIDOR ///////////////////////////////////
const { PORT } = process.env || 3000;

server.listen(PORT, () => {
   console.log("Servidor corriendo en el puerto:", PORT);
});


