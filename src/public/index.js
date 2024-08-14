const ws = new WebSocket('ws://localhost:3002')

let peerConnection
let localStream
let currentMatchId = null

ws.onopen = () => {
    console.log('WebSocket connection open')

    ws.send(JSON.stringify({ eventType: 'findMeAMatch' }))
}

// WebSocket mesaj alındığında
ws.onmessage = async (message) => {
    const { eventType, result, userId, yourId, sdp, candidate } = JSON.parse(message.data)

    switch (eventType) {
        case 'match-found':
            console.log('match founded:', { userId, yourId })
            currentMatchId = userId === yourId ? userId : yourId
            setupPeerConnection(userId, yourId)
            break

        case 'match-not-found':
            console.log('match-not-found')
            break

        case 'offer':
            await handleOffer(sdp, userId)
            break

        case 'answer':
            await handleAnswer(sdp)
            break

        case 'ice-candidate':
            await handleIceCandidate(candidate)
            break

        default:
            console.log('unknown eventType:', eventType)
            break
    }
}


ws.onclose = () => {
    console.log('WebSocket connection closed')
}

ws.onerror = (error) => {
    console.log('WebSocket error:', error)
}

async function setupPeerConnection(targetUserId, yourId) {
    peerConnection = new RTCPeerConnection()

    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream))

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            ws.send(JSON.stringify({
                eventType: 'ice-candidate',
                data: {
                    targetUserId,
                    candidate: event.candidate,
                }
            }))
        }
    }

    peerConnection.ontrack = (event) => {
        const remoteStream = new MediaStream()
        remoteStream.addTrack(event.track)
        document.getElementById('remoteVideo').srcObject = remoteStream
    }

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    ws.send(JSON.stringify({
        eventType: 'offer',
        data: {
            targetUserId,
            sdp: offer,
        }
    }))
}

async function handleOffer(sdp, targetUserId) {
    if (!peerConnection) setupPeerConnection(targetUserId, targetUserId)

    await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp))

    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    ws.send(JSON.stringify({
        eventType: 'answer',
        data: {
            targetUserId,
            sdp: answer,
        }
    }))
}

async function handleAnswer(sdp) {
    if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp))
    }
}

async function handleIceCandidate(candidate) {
    if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    }
}
