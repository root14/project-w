const ws = new WebSocket('ws://localhost:3002'); // WebSocket sunucu adresiniz

let peerConnection;
let localStream;
let currentMatchId = null;

ws.onopen = () => {
    console.log('WebSocket connection open');
    ws.send(JSON.stringify({ eventType: 'findMeAMatch' }));
};

ws.onmessage = async (message) => {
    const { eventType, data } = JSON.parse(message.data);

    // Check if data is defined
    if (!data) {
        console.error('Received message with undefined data:', message.data);
        return;
    }

    switch (eventType) {
        case 'match-found':
            console.log('Match found:', data);
            const { yourId, matchedUserId } = data;
            currentMatchId = yourId === currentMatchId ? matchedUserId : yourId;
            setupPeerConnection(currentMatchId);
            break;

        case 'match-not-found':
            console.log('Match not found');
            break;

        case 'offer':
            await handleOffer(data.sdp);
            break;

        case 'answer':
            await handleAnswer(data.sdp);
            break;

        case 'ice-candidate':
            await handleIceCandidate(data.candidate);
            break;

        default:
            console.log('Unknown event type:', eventType);
            break;
    }
};


ws.onclose = () => {
    console.log('WebSocket connection closed');
};

ws.onerror = (error) => {
    console.log('WebSocket error:', error);
};

async function setupPeerConnection(targetUserId) {
    peerConnection = new RTCPeerConnection();

    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            ws.send(JSON.stringify({
                eventType: 'ice-candidate',
                data: {
                    targetUserId,
                    candidate: event.candidate,
                }
            }));
        }
    };

    peerConnection.ontrack = (event) => {
        const remoteStream = new MediaStream();
        remoteStream.addTrack(event.track);

        // Assign the remote stream to the appropriate video element
        if (currentMatchId === targetUserId) {
            document.getElementById('user-1').srcObject = remoteStream;
        } else {
            document.getElementById('user-2').srcObject = remoteStream;
        }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    ws.send(JSON.stringify({
        eventType: 'offer',
        data: {
            targetUserId,
            sdp: offer,
        }
    }));
}

async function handleOffer(sdp) {
    if (!peerConnection) return;

    await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    ws.send(JSON.stringify({
        eventType: 'answer',
        data: {
            targetUserId: currentMatchId,
            sdp: answer,
        }
    }));
}

async function handleAnswer(sdp) {
    if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    }
}

async function handleIceCandidate(candidate) {
    if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
}
