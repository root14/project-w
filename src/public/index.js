import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const socket = io.connect("http://localhost:3000")

let peerId
let yourId

let localStream;
let remoteStream;
let peerConnection;

const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}


let constraints = {
    video: {
        width: { min: 640, ideal: 1920, max: 1920 },
        height: { min: 480, ideal: 1080, max: 1080 },
    },
    audio: true
}


async function init() {
    localStream = await navigator.mediaDevices.getUserMedia(constraints)
    document.getElementById('user-1').srcObject = localStream
}

//console.log(`member joined roomId ${data.roomId}`)

//const message = JSON.stringify({ message: "sample data" })
//socket.emit("MessageFromPeer", { to: peerId, from: yourId, message })

init()

socket.on('MemberJoined', async function (data) {
    peerId = data.peerId
    yourId = data.yourId


    console.log(`createOffer calisti ${yourId}`)
    createOffer(yourId)
})

socket.on("MessageFromPeer", async function (data) {
    peerId = data.from
    yourId = data.to

    console.log(`gelen peerId ${peerId}`)
    console.log(`gelen yourId ${yourId}`)
    console.log(`gelen messsage ${data.data}`)

    handleMessageFromPeer(data.data, peerId)
})

async function handleMessageFromPeer(data, id) {

    //message = JSON.parse(message)

    const result = JSON.parse(data)
    console.log(`handleMessageFromPeer ->${result.type}`)

    if (result.type === 'offer') {
        console.log(`createAnswer calisti`)
        createAnswer(id, result.offer)
    }

    if (result.type === 'answer') {
        console.log(`addAnswer calisti`)
        addAnswer(result.answer)
    }

    if (result.type === 'candidate') {
        if (peerConnection) {
            console.log(`addIceCandidate calisti`)
            peerConnection.addIceCandidate(result.candidate)
        }
    }
}


let createAnswer = async (MemberId, offer) => {
    await createPeerConnection(MemberId)

    await peerConnection.setRemoteDescription(offer)

    let answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    const message = JSON.stringify({ "type": "answer", "answer": answer })
    socket.emit("MessageFromPeer", { to: peerId, from: yourId, message: message })
}

let createOffer = async (MemberId) => {
    await createPeerConnection(MemberId)

    let offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    const message = JSON.stringify({ "type": "offer", "offer": offer })
    socket.emit("MessageFromPeer", { to: peerId, from: yourId, message: message })
}

let addAnswer = async (answer) => {
    if (!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer)
    }
}

let createPeerConnection = async (MemberId) => {
    peerConnection = new RTCPeerConnection(servers)

    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream
    document.getElementById('user-2').style.display = 'block'

    document.getElementById('user-1').classList.add('smallFrame')


    if (!localStream) {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        document.getElementById('user-1').srcObject = localStream
    }

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
        })
    }

    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {

            const message = JSON.stringify({ "type": "candidate", "candidate": event.candidate })
            socket.emit("MessageFromPeer", { to: peerId, from: yourId, message: message })
        }
    }
}