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

    let lines: (drawLineCoords | null)[] = [];
    let totalLines: number = 0;

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

    socket.on('new line', ({isDrawing, coords}: newLineParams)=>{
        lines.push({
            x1: coords.x1, 
            y1: coords.y1, 
            x2: coords.x2, 
            y2: coords.y2
        }); 

        if(!isDrawing){
            lines.push(null);

            totalLines++;
        }
        
        io.emit('draw line', {
            x1: coords.x1, 
            y1: coords.y1, 
            x2: coords.x2, 
            y2: coords.y2
        });
    })


    socket.on('disconnect', ()=>{
        console.log('a user disconnected: ' + socket.id);

        const index = connectedSockets.indexOf(socket);
        connectedSockets.splice(index, 1)

        if(index === 0){
            oldestSocket = connectedSockets[0];
        }       
    })
});

server.listen(3000, ()=>{
    console.log('Listening to port 3000');
});