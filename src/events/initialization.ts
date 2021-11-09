import { User } from "../model/User";

function initialization(user: User, connectedUsers: User[]) {
    connectedUsers.push(user);

    user.socket.emit('user connected', {
        id: user.socket.id,
        connectedClients: {
            id: connectedUsers.map(user => user.socket.id),
            color: connectedUsers.map(user => user.drawColor)
        }
    });

    user.socket.broadcast.emit('new user connected', {
        id: user.socket.id,
        color: 'black'
    });

    if(connectedUsers.length > 0){
        connectedUsers[0].socket.emit('request current canvas', (response: any)=>{
            user.socket.emit('send current canvas content', (response.imgData.data));
        });
    }
}

export {initialization};