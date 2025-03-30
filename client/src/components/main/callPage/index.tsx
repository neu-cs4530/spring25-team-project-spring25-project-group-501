import { useRef } from 'react';
import IncomingCall from './IncomingCall';
import Options from './Options';
import VideoPlayer from './VideoPlayer';
import useCallPage from '../../../hooks/useCallPage';

const CallPage = () => {
  const myVideo = useRef<HTMLVideoElement | null>(null);
  const userVideo = useRef<HTMLVideoElement | null>(null);

  const { call, callAccepted, stream, callEnded, name, mySocket, callUser, leaveCall, answerCall } =
    useCallPage({ myVideo, userVideo });

  return (
    <div>
      <h1>Call Page</h1>
      <VideoPlayer
        stream={stream}
        name={name}
        myVideo={myVideo}
        userVideo={userVideo}
        call={call}
        callAccepted={callAccepted}
        callEnded={callEnded}
      />
      <Options
        mySocket={mySocket}
        callAccepted={callAccepted}
        callEnded={callEnded}
        leaveCall={leaveCall}
        callUser={callUser}>
        <IncomingCall answerCall={answerCall} call={call} callAccepted={callAccepted} />
      </Options>
    </div>
  );
};

export default CallPage;
