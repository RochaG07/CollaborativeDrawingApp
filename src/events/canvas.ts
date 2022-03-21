import { Server } from "socket.io";
import { User } from "../model/User";

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

function canvas(io: Server, user: User) {
    let erasableLines: (drawLineCoords | null)[] = [];
    let totalLines: number = 0;

    user.socket.on('new line', ({isDrawing, coords}: newLineParams)=>{
        erasableLines.push({
            x1: coords.x1, 
            y1: coords.y1, 
            x2: coords.x2, 
            y2: coords.y2,
            color: user.drawColor
        }); 

        if(!isDrawing){
            erasableLines.push(null);

            totalLines++;

            if(totalLines > 3){
                const firstNullIndex = erasableLines.indexOf(null);
    
                erasableLines = erasableLines.slice(firstNullIndex + 1);
            }
        };

        io.emit('draw line', {
            x1: coords.x1, 
            y1: coords.y1, 
            x2: coords.x2, 
            y2: coords.y2,
            color: user.drawColor
        });
    });

    user.socket.on('clear canvas', () => {
        user.socket.broadcast.emit('clear canvas');
    })

    user.socket.on('update mouse coords', ({x, y}:mouseCoords) => {
        user.socket.broadcast.emit('mouse coords', {
            id: user.socket.id,
            x,
            y
        });
    });
}

export {canvas};