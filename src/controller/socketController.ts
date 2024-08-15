import { io } from "../server"


const waitingRoom = new Array<string>()

function handleSocketConnections() {


    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        //someone waiting
        if (waitingRoom.length > 0) {
            const waitingRoomId = waitingRoom.pop()

            socket.join(waitingRoomId!)

            socket.emit("joinedRoom", JSON.stringify({
                roomId: waitingRoomId
            }))
        } else {
            //nobody
            waitingRoom.push(socket.id)
            socket.join(socket.id)
        }

        socket.on('offer', (offer, roomId) => {
            socket.to(roomId).emit('offer', offer);
        });

        socket.on('answer', (answer, roomId) => {
            socket.to(roomId).emit('answer', answer);
        });

        socket.on('ice candidate', (candidate, roomId) => {
            socket.to(roomId).emit('ice candidate', candidate);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

}

export default handleSocketConnections
