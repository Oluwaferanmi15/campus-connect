import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSocket } from '../hooks/useSocket';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];
if (import.meta.env.VITE_TURN_URL) {
  ICE_SERVERS.push({
    urls: import.meta.env.VITE_TURN_URL,
    username: import.meta.env.VITE_TURN_USERNAME,
    credential: import.meta.env.VITE_TURN_CREDENTIAL,
  });
}

const CallContext = createContext(null);
export const useCall = () => useContext(CallContext);

const formatDuration = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

function CallAvatar({ peer, large }) {
  const size = large ? 'call-avatar--lg' : '';
  return peer?.avatarUrl ? (
    <img src={peer.avatarUrl} alt="" className={`call-avatar ${size}`} />
  ) : (
    <span className={`call-avatar call-avatar--placeholder ${size}`}>
      {peer?.name?.[0]?.toUpperCase()}
    </span>
  );
}

export function CallProvider({ children }) {
  const socketRef = useSocket();

  const [call, setCall] = useState(null); // { status, peer, video, conversationId }
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [notice, setNotice] = useState('');

  const callRef = useRef(null);
  const pcRef = useRef(null);
  const localRef = useRef(null);
  const pendingIce = useRef([]);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  const emit = (event, payload, ack) => socketRef.current?.emit(event, payload, ack);

  const updateCall = (next) => {
    callRef.current = next;
    setCall(next);
  };

  const updateStatus = (status) => {
    if (callRef.current) updateCall({ ...callRef.current, status });
  };

  const notify = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 4000);
  };

  const cleanup = () => {
    pcRef.current?.close();
    pcRef.current = null;
    localRef.current?.getTracks().forEach((t) => t.stop());
    localRef.current = null;
    pendingIce.current = [];
    setLocalStream(null);
    setRemoteStream(null);
    setMuted(false);
    setCameraOff(false);
    setSeconds(0);
    callRef.current = null;
    setCall(null);
  };

  const getMedia = async (video) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: video ? { facingMode: 'user' } : false,
      });
      localRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      notify(video ? 'Could not access camera or microphone' : 'Could not access microphone');
      return null;
    }
  };

  const endCall = () => {
    const current = callRef.current;
    if (current) emit('call:end', { toUserId: current.peer._id });
    cleanup();
  };

  const createPeer = (peerId) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (e) => {
      if (e.candidate) emit('call:ice', { toUserId: peerId, candidate: e.candidate });
    };
    pc.ontrack = (e) => setRemoteStream(e.streams[0]);
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') updateStatus('active');
      if (pc.connectionState === 'failed') {
        notify('Call failed to connect');
        endCall();
      }
    };

    localRef.current.getTracks().forEach((track) => pc.addTrack(track, localRef.current));
    pcRef.current = pc;
    return pc;
  };

  const flushIce = async () => {
    const pc = pcRef.current;
    if (!pc) return;
    for (const candidate of pendingIce.current) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (err) {
        // ignore stale candidates
      }
    }
    pendingIce.current = [];
  };

  const startCall = async ({ conversationId, peer, video }) => {
    if (callRef.current) return;
    const stream = await getMedia(video);
    if (!stream) return;

    updateCall({ status: 'outgoing', peer, video, conversationId });
    emit('call:invite', { conversationId, toUserId: peer._id, video }, (res) => {
      if (res?.error) {
        notify(res.error === 'offline' ? `${peer.name} is offline right now` : 'Could not start the call');
        cleanup();
      }
    });
  };

  const acceptCall = async () => {
    const current = callRef.current;
    if (!current || current.status !== 'incoming') return;

    const stream = await getMedia(current.video);
    if (!callRef.current) {
      // caller hung up while we were asking for permissions
      stream?.getTracks().forEach((t) => t.stop());
      return;
    }
    if (!stream) {
      emit('call:reject', { toUserId: current.peer._id });
      cleanup();
      return;
    }
    updateCall({ ...current, status: 'connecting' });
    emit('call:accept', { toUserId: current.peer._id });
  };

  const declineCall = () => {
    const current = callRef.current;
    if (current) emit('call:reject', { toUserId: current.peer._id });
    cleanup();
  };

  const toggleMute = () => {
    const track = localRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMuted(!track.enabled);
    }
  };

  const toggleCamera = () => {
    const track = localRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCameraOff(!track.enabled);
    }
  };

  // Socket listeners
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onIncoming = ({ conversationId, from, video }) => {
      if (callRef.current) {
        socket.emit('call:reject', { toUserId: from._id, reason: 'busy' });
        return;
      }
      updateCall({ status: 'incoming', peer: from, video, conversationId });
    };

    const onAccepted = async () => {
      const current = callRef.current;
      if (!current || current.status !== 'outgoing') return;
      updateCall({ ...current, status: 'connecting' });
      const pc = createPeer(current.peer._id);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('call:offer', { toUserId: current.peer._id, offer });
    };

    const onOffer = async ({ offer }) => {
      const current = callRef.current;
      if (!current || !localRef.current) return;
      const pc = createPeer(current.peer._id);
      await pc.setRemoteDescription(offer);
      await flushIce();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('call:answer', { toUserId: current.peer._id, answer });
    };

    const onAnswer = async ({ answer }) => {
      const pc = pcRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(answer);
      await flushIce();
    };

    const onIce = async ({ candidate }) => {
      const pc = pcRef.current;
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(candidate);
        } catch (err) {
          // ignore
        }
      } else {
        pendingIce.current.push(candidate);
      }
    };

    const onRejected = ({ reason }) => {
      notify(reason === 'busy' ? 'User is busy on another call' : 'Call declined');
      cleanup();
    };

    const onEnded = () => {
      if (callRef.current) notify('Call ended');
      cleanup();
    };

    socket.on('call:incoming', onIncoming);
    socket.on('call:accepted', onAccepted);
    socket.on('call:offer', onOffer);
    socket.on('call:answer', onAnswer);
    socket.on('call:ice', onIce);
    socket.on('call:rejected', onRejected);
    socket.on('call:ended', onEnded);

    return () => {
      socket.off('call:incoming', onIncoming);
      socket.off('call:accepted', onAccepted);
      socket.off('call:offer', onOffer);
      socket.off('call:answer', onAnswer);
      socket.off('call:ice', onIce);
      socket.off('call:rejected', onRejected);
      socket.off('call:ended', onEnded);
    };
  }, [socketRef]);

  // Call duration timer
  useEffect(() => {
    if (call?.status !== 'active') return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [call?.status]);

  // Give up if nobody answers
  useEffect(() => {
    if (call?.status !== 'outgoing') return;
    const timer = setTimeout(() => {
      if (callRef.current?.status === 'outgoing') {
        notify('No answer');
        endCall();
      }
    }, 45000);
    return () => clearTimeout(timer);
  }, [call?.status]);

  // Attach streams to the video elements
  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream, call?.status]);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream, call?.status]);

  const isIncoming = call?.status === 'incoming';
  const inCall = !!call && !isIncoming;
  const statusLabel =
    call?.status === 'outgoing'
      ? 'Calling…'
      : call?.status === 'connecting'
      ? 'Connecting…'
      : formatDuration(seconds);

  return (
    <CallContext.Provider value={{ startCall, inCall: !!call }}>
      {children}

      {notice && <div className="call-toast">{notice}</div>}

      {isIncoming && (
        <div className="call-incoming">
          <CallAvatar peer={call.peer} />
          <div className="call-incoming-text">
            <strong>{call.peer.name}</strong>
            <span>Incoming {call.video ? 'video' : 'voice'} call</span>
          </div>
          <button className="call-btn call-btn--decline" onClick={declineCall} aria-label="Decline">
            ✕
          </button>
          <button className="call-btn call-btn--accept" onClick={acceptCall} aria-label="Accept">
            ✓
          </button>
        </div>
      )}

      {inCall && (
        <div className="call-screen">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={call.video ? 'call-remote' : 'call-remote call-remote--hidden'}
          />

          {!call.video && (
            <div className="call-voice">
              <CallAvatar peer={call.peer} large />
              <h2>{call.peer.name}</h2>
              <p>{statusLabel}</p>
            </div>
          )}

          {call.video && (
            <div className="call-info">
              <strong>{call.peer.name}</strong>
              <span>{statusLabel}</span>
            </div>
          )}

          {call.video && (
            <video ref={localVideoRef} autoPlay playsInline muted className="call-local" />
          )}

          <div className="call-controls">
            <button
              className={`call-btn call-btn--ghost ${muted ? 'is-off' : ''}`}
              onClick={toggleMute}
              aria-label="Mute"
            >
              {muted ? '🔇' : '🎤'}
            </button>
            {call.video && (
              <button
                className={`call-btn call-btn--ghost ${cameraOff ? 'is-off' : ''}`}
                onClick={toggleCamera}
                aria-label="Camera"
              >
                {cameraOff ? '🚫' : '📷'}
              </button>
            )}
            <button className="call-btn call-btn--end" onClick={endCall} aria-label="End call">
              📞
            </button>
          </div>
        </div>
      )}
    </CallContext.Provider>
  );
}