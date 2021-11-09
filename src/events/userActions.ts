import { avaliableColors, User } from "../model/User";

function userActions( user: User) {
    user.socket.on('clear canvas', () => {
        user.socket.broadcast.emit('clear canvas');
    })

    user.socket.on('pick color', (color: avaliableColors) => {
        user.changeDrawingColor(color);

        user.socket.broadcast.emit('color change', {
            id: user.socket.id,
            color,
        });
    })
}

export {userActions};