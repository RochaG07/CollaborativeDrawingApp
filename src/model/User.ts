import { Socket } from "socket.io";

export enum avaliableColors{
    Black = 'black',
    Red = 'red',
    Blue = 'blue',
    Pink = 'pink',
    Green = 'green'
}

export class User{
    socket: Socket;
    drawColor: avaliableColors;

    constructor(socket: Socket){
        this.socket = socket;

        this.drawColor = avaliableColors.Black;
    }

    changeDrawingColor(newColor: avaliableColors) {
        this.drawColor = newColor
    }
}