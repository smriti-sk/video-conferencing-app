const express = require('express');
const bodyParser = require('body-parser');
const {Server} = require('socket.io');

const io = new Server({
    cors: true,
}); //a socket server
const app = express();

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

app.use(bodyParser.json());
io.on('connection', (socket) => {
    console.log("New Connection");
    socket.on('join-room', (data) => {

        const {roomId, emailId} = data;
        console.log("User ", emailId, "joined Room ", roomId);
        emailToSocketMapping.set(emailId, socket.id);
        socketToEmailMapping.set( socket.id, emailId);
        socket.join(roomId);    
        socket.emit("joined-room", {roomId})
        socket.broadcast.to(roomId).emit("user-joined", {emailId});
    });

    socket.on('call-user', data => {
        const {emailId, offer} = data;
        const fromEmail = socketToEmailMapping.get(socket.id);
        const socketId = emailToSocketMapping.get(emailId);
        socket.to(socketId).emit('incoming-call', {from: fromEmail, offer})
    });

    socket.on("call-accepted", (data) => {
        const {emailId, ans} = data;
        const socketId = emailToSocketMapping.get(emailId);
        socket.to(socketId).emit("call-accepted", {ans});
    })
});

app.listen(8000, ()=> console.log("HHTP Server running at 8000 PORT"));
io.listen(8001);


