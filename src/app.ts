import express from 'express';

import {Server, Socket} from 'socket.io';
import http from 'http';

interface drawLineCoords{
    x1: number;
    y1: number; 
    x2: number;
    y2: number;
}

interface newLineParams{
    coords: drawLineCoords,
    isDrawing: boolean
}

const app = express();

const server = http.createServer(app);
const io = new Server(server);

const connectedSockets: Socket[] = [];

let oldestSocket: Socket| null;

let latestImgData: ImageData | null;

app.get('/', (req, res)=>{
    return res.sendFile(__dirname + '/view/index.html');
})

io.on('connection', (socket) => {
    console.log('a user connected: ' + socket.id);

    let isDrawing: boolean = false;

    connectedSockets.push(socket);

    if(connectedSockets.length === 1 && latestImgData){
        socket.emit('send current canvas content', (latestImgData));
    }

    if(!oldestSocket){
        oldestSocket = socket;
    } else {
        oldestSocket.emit('request current canvas', (response: any)=>{
            latestImgData = response.imgData.data;

            socket.emit('send current canvas content', (latestImgData));
        });
    } 

    socket.on('disconnect', ()=>{
        console.log('a user disconnected: ' + socket.id);

        const index = connectedSockets.indexOf(socket);
        connectedSockets.splice(index, 1)

        if(index === 0){
            oldestSocket = connectedSockets[0];
        }
        
    })

    socket.on('new line', ({x1, y1, x2, y2}: drawLineCoords)=>{
        io.emit('draw line', {x1, y1, x2, y2});
    })


});

server.listen(3000, ()=>{
    console.log('Listening to port 3000');
});