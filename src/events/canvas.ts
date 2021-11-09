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
       let lines: (drawLineCoords | null)[] = [];
       let totalLines: number = 0; //TODO pensar em um nome melhor
   
       user.socket.on('new line', ({isDrawing, coords}: newLineParams)=>{
           lines.push({
               x1: coords.x1, 
               y1: coords.y1, 
               x2: coords.x2, 
               y2: coords.y2,
               color: user.drawColor
           }); 
   
           if(!isDrawing){
               lines.push(null);
   
               totalLines++;
           }

           console.log(lines);
           
           io.emit('draw line', {
               x1: coords.x1, 
               y1: coords.y1, 
               x2: coords.x2, 
               y2: coords.y2,
               color: user.drawColor
           });
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