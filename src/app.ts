import express from 'express';

import {Server, Socket} from 'socket.io';
import http from 'http';

import path from 'path';

interface drawLineCoords{
    x1: number,
    y1: number, 
    x2: number,
    y2: number,
    color: string
}

interface newLineParams{
    coords: drawLineCoords,
    isDrawing: boolean
}

interface mouseCoords{
    x: string,
    y: string,
}

interface connectedClients{
    socket: Socket,
    color: string,
}

enum avaliableColors{
    Black = 'black',
    Red = 'red',
    Blue = 'blue',
    Pink = 'pink',
    Green = 'green'
}

const app = express();

const server = http.createServer(app);
const io = new Server(server);

const connectedClients: connectedClients[] = [];

app.use('/assets', express.static(path.join(path.resolve(__dirname, '..', 'public', 'assets'))));

app.get('/', (req, res)=>{
    return res.sendFile(__dirname + '/view/index.html');
})

io.on('connection', (socket) => {
    console.log('a user connected: ' + socket.id);

    let lines: (drawLineCoords | null)[] = [];
    let totalLines: number = 0;
    
    let drawColor = avaliableColors.Black;

    connectedClients.push({
        socket,
        color: drawColor
    });

    socket.emit('user connected', {
        id: socket.id,
        connectedClients: {
            id: connectedClients.map(client => client.socket.id),
            color: connectedClients.map(client => client.color)
        }
    });

    socket.broadcast.emit('new user connected', {
        id: socket.id,
        color: drawColor
    });


    if(connectedClients.length > 0){
        connectedClients[0].socket.emit('request current canvas', (response: any)=>{
            socket.emit('send current canvas content', (response.imgData.data));
        });
    }

    socket.on('new line', ({isDrawing, coords}: newLineParams)=>{
        lines.push({
            x1: coords.x1, 
            y1: coords.y1, 
            x2: coords.x2, 
            y2: coords.y2,
            color: drawColor
        }); 

        if(!isDrawing){
            lines.push(null);

            totalLines++;
        }
        
        io.emit('draw line', {
            x1: coords.x1, 
            y1: coords.y1, 
            x2: coords.x2, 
            y2: coords.y2,
            color: drawColor
        });
    })

    socket.on('update mouse coords', ({x, y}:mouseCoords) => {
        socket.broadcast.emit('mouse coords', {
            id: socket.id,
            x,
            y
        });
    });

    socket.on('clear canvas', () => {
        socket.broadcast.emit('clear canvas');
    })

    socket.on('pick color', (color: avaliableColors) => {
        drawColor = color;

        //Change color in array 
        let client = connectedClients.find(connectedClient => connectedClient.socket.id === socket.id);
        if(client){
            client.color = color;
        }

        socket.broadcast.emit('color change', {
            id: socket.id,
            color,
        });
    })

    socket.on('disconnect', ()=>{
        console.log('a user disconnected: ' + socket.id);

        socket.broadcast.emit('user disconnected', socket.id);

        const index = connectedClients.map((client) => client.socket).indexOf(socket);

        connectedClients.splice(index, 1);    
    })
});
 
export {server};