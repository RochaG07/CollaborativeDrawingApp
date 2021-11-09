import express from 'express';

import {Server, Socket} from 'socket.io';
import http from 'http';

import path from 'path';

import { initialization } from './events/initialization';
import { userActions } from './events/userActions';
import { User } from './model/User';
import { canvas } from './events/canvas';

const app = express();

const server = http.createServer(app);
const io = new Server(server);

const connectedUsers: User[] = [];

app.use('/assets', express.static(path.join(path.resolve(__dirname, '..', 'public', 'assets'))));

app.get('/', (req, res)=>{
    return res.sendFile(__dirname + '/view/index.html');
})

io.on('connection', (socket) => {
    console.log('a user connected: ' + socket.id);

    const user = new User(socket);

    initialization(user, connectedUsers);

    canvas(io, user);

    userActions(user);


    socket.on('disconnect', () => {
        console.log('a user disconnected: ' + socket.id);

        socket.broadcast.emit('user disconnected', socket.id);

        const index = connectedUsers.map((user) => user.socket).indexOf(socket);

        connectedUsers.splice(index, 1);  
    })
});
 
export {server};