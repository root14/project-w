import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const socket = io.connect("http://localhost:3000")


const localVideo = document.getElementById('user-1');
const remoteVideo = document.getElementById('user-2');

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
        localVideo.srcObject = stream;
    })
    .catch((error) => {
        console.error('Error accessing media devices.', error);
    });


let peerConnection;
let localRoomId

function createPeerConnection() {
    const config = {
        iceServers: [
            {
                urls: 'stun:stun.l.google.com:19302'
            }
        ]
    };

    peerConnection = new RTCPeerConnection(config);

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice candidate', event.candidate, localRoomId);
        }
    };

    // Handle remote video stream
    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    // Add local stream to peer connection
    const localStream = localVideo.srcObject;
    for (const track of localStream.getTracks()) {
        peerConnection.addTrack(track, localStream);
    }
}

socket.on('joinedRoom', async (data) => {
    const { roomId } = data

    console.log(`joined room ${roomId}`)

    //createPeerConnection()
    //const offer = await peerConnection.createOffer()
    //await peerConnection.setLocalDescription(offer)

    //socket.to(roomId).emit('offer', offer, roomId)
    //socket.emit('offer', offer, roomId)
})

socket.on('offer', async (roomId) => {
    if (!peerConnection) {
        createPeerConnection();
    }

    let offer1 = await peerConnection.createOffer()
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer1));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    localRoomId = roomId
    socket.emit('answer', answer, roomId);
});

socket.on('answer', async (answer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('ice candidate', async (candidate) => {
    try {
        await peerConnection.addIceCandidate(candidate);
    } catch (error) {
        console.error('Error adding received ice candidate', error);
    }
});