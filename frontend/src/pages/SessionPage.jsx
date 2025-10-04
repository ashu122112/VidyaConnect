import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Peer from 'simple-peer';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import useAuth from '../hooks/useAuth';
import { API_BASE_URL } from '../services/apiConfig';

// Polyfill for simple-peer compatibility with Vite
if (typeof global === 'undefined') {
  window.global = window;
}

const SessionPage = () => {
    const { sessionId } = useParams();
    const { user } = useAuth();
    const myVideo = useRef();
    const peersRef = useRef({});
    const [peers, setPeers] = useState([]);
    const stompClient = useRef(null);
    const localStreamRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!user || !token) return;

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            if (myVideo.current) myVideo.current.srcObject = stream;
            localStreamRef.current = stream;

            const client = new Client({
                webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
                connectHeaders: { Authorization: `Bearer ${token}` },
                onConnect: () => {
                    client.subscribe(`/topic/signal/${sessionId}`, msg => {
                        const { sender, data, receiver } = JSON.parse(msg.body);
                        if (sender === user.email || (receiver && receiver !== user.email)) return;
                        
                        let peer = peersRef.current[sender];
                        if (data.type === 'offer') {
                            peer = createPeer(sender, false, stream);
                            peer.signal(data);
                            peersRef.current[sender] = peer;
                            setPeers(prev => [...prev.filter(p => p.peerID !== sender), { peerID: sender, peer }]);
                        } else if (peer) {
                            peer.signal(data);
                        }
                    });
                    
                    if (user.role === 'STUDENT') {
                         client.publish({ destination: `/app/signal/${sessionId}`, body: JSON.stringify({ sender: user.email, data: { type: 'join' } }) });
                    }

                     client.subscribe(`/topic/join/${sessionId}`, msg => {
                        const { sender } = JSON.parse(msg.body);
                         if (user.role === 'TEACHER' && sender !== user.email) {
                             const newPeer = createPeer(sender, true, stream);
                             peersRef.current[sender] = newPeer;
                             setPeers(prev => [...prev.filter(p => p.peerID !== sender), { peerID: sender, peer: newPeer }]);
                         }
                    });
                },
            });

            client.activate();
            stompClient.current = client;
        }).catch(() => alert("Could not access camera/microphone."));

        return () => {
            if (stompClient.current) stompClient.current.deactivate();
            Object.values(peersRef.current).forEach(p => p.destroy());
            if(localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
        };
    }, [sessionId, user]);

    function createPeer(peerID, initiator, stream) {
        const peer = new Peer({ initiator, trickle: true, stream });
        peer.on("signal", signal => {
             if (stompClient.current?.connected) {
                stompClient.current.publish({ destination: `/app/signal/${sessionId}`, body: JSON.stringify({ sender: user.email, receiver: peerID, data: signal }) });
            }
        });
        peer.on('close', () => {
            setPeers(prev => prev.filter(p => p.peerID !== peerID));
            delete peersRef.current[peerID];
        });
        return peer;
    }

    const Video = ({ peer }) => {
        const ref = useRef();
        useEffect(() => {
            peer.on('stream', stream => { if (ref.current) ref.current.srcObject = stream; });
        }, [peer]);
        return <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />;
    };

    return (
        <div className="flex flex-col h-screen p-4 bg-gray-900 text-white">
            <header className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Session: {sessionId}</h1>
                <Link to="/dashboard" className="px-4 py-2 text-white bg-red-500 rounded-md">Leave</Link>
            </header>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
                 <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    <video muted ref={myVideo} autoPlay playsInline className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 rounded text-sm">You ({user.email})</span>
                </div>
                {peers.map(({ peerID, peer }) => (
                     <div key={peerID} className="relative bg-black rounded-lg overflow-hidden aspect-video">
                        <Video peer={peer} />
                        <span className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 rounded text-sm">{peerID}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default SessionPage;

