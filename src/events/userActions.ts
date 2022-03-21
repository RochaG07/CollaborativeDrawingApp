import { avaliableColors, User } from "../model/User";

function userActions( user: User) {


    user.socket.on('pick color', (color: avaliableColors) => {
        user.changeDrawingColor(color);

        user.socket.broadcast.emit('color change', {
            id: user.socket.id,
            color,
        });
    })


}

export {userActions};