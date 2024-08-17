import { io } from "../server"


const waitingRoom = new Array<string>()

function handleSocketConnections() {


    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        //someone waiting
        if (waitingRoom.length > 0) {
            const waitingId = waitingRoom.pop()

            socket.emit("MemberJoined", { peerId: waitingId, yourId: socket.id })

            console.log("memberjoined room")
        } else {
            //nobody
            waitingRoom.push(socket.id)
            socket.join(socket.id)
            console.log(`no one waiting joined room -> ${socket.id}`)
        }


        socket.on("MessageFromPeer", async function (data) {
            const from = data.from
            const to = data.to
            const message = data.message

            //message can be json
            io.to(to).emit("MessageFromPeer", { from: from, to: to, data: message })
            //console.log(`messagefrompeer ${message}`)
        })


        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        })
    });

}

export default handleSocketConnections
