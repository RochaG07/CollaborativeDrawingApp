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
    id: string
}

enum avaliableColors{
    Black = 'black',
    Red = 'red',
    Blue = 'blue',
    Pink = 'pink',
    Green = 'green'
}

const app = express();

app.use('/assets', express.static(path.join(path.resolve(__dirname, '..', 'public', 'assets'))));

const server = http.createServer(app);
const io = new Server(server);

const connectedSockets: Socket[] = [];

//let latestImgData: ImageData | null;


app.get('/', (req, res)=>{
    return res.sendFile(__dirname + '/view/index.html');
})

io.on('connection', (socket) => {
    console.log('a user connected: ' + socket.id);

    let lines: (drawLineCoords | null)[] = [];
    let totalLines: number = 0;

    
    let color = avaliableColors.Black;

    connectedSockets.push(socket);

    socket.emit('user connected', {
        id: socket.id,
        connectedIds: connectedSockets.map(user => user.id),
    });

    socket.broadcast.emit('new user connected', socket.id);


    if(connectedSockets.length === 1){
        //socket.emit('send current canvas content', (latestImgData));
    }
    else{
        connectedSockets[0].emit('request current canvas', (response: any)=>{
            //latestImgData = response.imgData.data;

            socket.emit('send current canvas content', (response.imgData.data));
        });
    }

    socket.on('new line', ({isDrawing, coords}: newLineParams)=>{
        lines.push({
            x1: coords.x1, 
            y1: coords.y1, 
            x2: coords.x2, 
            y2: coords.y2,
            color
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
            color
        });
    })

    socket.on('update mouse coords', ({x, y, id}:mouseCoords) => {
        //console.log(`X: ${x} | Y: ${y}`);

        socket.broadcast.emit('mouse coords', {x, y, id});
    });


    socket.on('disconnect', ()=>{
        console.log('a user disconnected: ' + socket.id);

        socket.broadcast.emit('user disconnected', socket.id);

        const index = connectedSockets.indexOf(socket);
        connectedSockets.splice(index, 1);    
    })
});

server.listen(3000, ()=>{
    console.log('Listening to port 3000');
});