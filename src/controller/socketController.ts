import { io } from "../server"


const waitingRoom = new Array<string>()

function handleSocketConnections() {


    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        //someone waiting
        if (waitingRoom.length > 0) {
            const roomId = waitingRoom.pop()

            socket.join(roomId!)

            socket.to(roomId!).emit("offer", { roomId: roomId })
            console.log(`some one waiting joined to room. roomId -> ${roomId}`)

        } else {
            //nobody
            waitingRoom.push(socket.id)
            socket.join(socket.id)
            console.log(`no one waiting joined room -> ${socket.id}`)
        }

        socket.on('offer', (roomId) => {
            socket.to(roomId).emit('offer', roomId);
            console.log(`offer room id -> ${roomId}`)
        })

        socket.on('answer', (answer, roomId) => {
            socket.to(roomId).emit('answer', answer);
            console.log(`offer room id -> ${roomId} answer ->${answer}`)
        })

        socket.on('ice candidate', (candidate, roomId) => {
            const localRoomId: string = roomId
            socket.to(roomId).emit('ice candidate', candidate);
            console.log(`ice candidate room id -> ${localRoomId} candidate ->${candidate}`)
        })

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        })
    });

}

export default handleSocketConnections
