import { useState, useRef, useEffect } from 'react';
import Peer, { SignalData } from 'simple-peer';
import process from 'process';

import useUserContext from './useUserContext';

window.process = process;

export type CallType = {
  isReceivedCall: boolean;
  from: string;
  name: string | undefined;
  signal: SignalData | undefined;
  muted?: boolean;
};

/**
 * useCallPage is a custom hook that provides functionality for managing state and functions for the call page.
 */
const useCallPage = ({
  myVideo,
  userVideo,
}: {
  myVideo: React.MutableRefObject<HTMLVideoElement | null>;
  userVideo: React.MutableRefObject<HTMLVideoElement | null>;
}) => {
  const { user, socket } = useUserContext();

  const [stream, setStream] = useState<MediaStream>();
  const [muted, setMuted] = useState<boolean>(false);
  const [call, setCall] = useState<CallType>({
    isReceivedCall: false,
    from: '',
    name: undefined,
    signal: undefined,
  });
  const [callAccepted, setCallAccepted] = useState<boolean>(false);
  const [callEnded, setCallEnded] = useState<boolean>(false);

  const connectionRef = useRef<Peer.Instance>();

  /*
   * useEffect hook to get the media stream and set it to the video element
   * Also, listen for the callUser event and set the call state
   */
  useEffect(() => {
    // use video and audio from user's browser
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(currentStream => {
      setStream(currentStream);
      // take our video ref and set it to the currentStream so that we can play the video
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
        myVideo.current.muted = true;
      }
    });

    socket.on('callUser', ({ from, name: callerName, signal }) => {
      setCall({ isReceivedCall: true, from, name: callerName, signal });
    });
  }, [myVideo, socket, muted]);

  const callUser = (id: string) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on('signal', (data: SignalData) => {
      socket.emit('callUser', {
        userToCall: id,
        signalData: data,
        from: socket.id ?? '',
        name: user.username,
      });
    });

    peer.on('stream', (currentStream: MediaStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    socket.on('callAccepted', signal => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;

    peer.on('close', () => {
      setCallEnded(true);

      if (userVideo.current) {
        userVideo.current.srcObject = null;
      }
    });

    peer.on('error', _ => {
      setCallEnded(true);
    });
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on('signal', (data: SignalData) => {
      socket.emit('answerCall', { signal: data, to: call.from });
    });

    peer.on('stream', (currentStream: MediaStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    if (call.signal) {
      peer.signal(call.signal);
    }

    connectionRef.current = peer;

    peer.on('close', () => {
      setCallEnded(true);

      if (userVideo.current) {
        userVideo.current.srcObject = null;
      }
    });

    peer.on('error', _ => {
      setCallEnded(true);
    });
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
  };

  const toggleMuted = () => {
    setMuted(prevMuted => {
      const newMuted = !prevMuted;

      if (connectionRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const peerConnection = (connectionRef.current as any)._pc as RTCPeerConnection | undefined;

        const sender = peerConnection
          ?.getSenders()
          .find((s: RTCRtpSender) => s.track?.kind === 'audio');

        if (sender && sender.track) {
          // Always toggle the track currently being sent
          sender.track.enabled = !newMuted;

          // Optional: re-send the track only on unmute, just in case
          if (!newMuted) {
            const freshTrack = stream?.getAudioTracks()[0];
            if (freshTrack && freshTrack !== sender.track) {
              sender.replaceTrack(freshTrack).catch((err: unknown) => {
                /* Error */
              });
            }
          }
        }
      }

      return newMuted;
    });
  };

  return {
    call,
    callAccepted,
    stream,
    muted,
    toggleMuted,
    callEnded,
    name: user.username,
    mySocket: socket.id ?? '',
    callUser,
    leaveCall,
    answerCall,
  };
};

export default useCallPage;
