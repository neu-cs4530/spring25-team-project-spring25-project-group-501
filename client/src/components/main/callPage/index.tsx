import { useRef } from 'react';
import IncomingCall from './IncomingCall';
import Options from './Options';
import VideoPlayer from './VideoPlayer';
import useCallPage from '../../../hooks/useCallPage';

const CallPage = () => {
  const myVideo = useRef<HTMLVideoElement | null>(null);
  const userVideo = useRef<HTMLVideoElement | null>(null);

  const {
    call,
    callAccepted,
    stream,
    callEnded,
    name,
    mySocket,
    callUser,
    leaveCall,
    answerCall,
    muted,
    toggleMuted,
  } = useCallPage({ myVideo, userVideo });

  return (
    <div className='m-4'>
      <h1 className='text-2xl font-bold'>Call Page</h1>
      <VideoPlayer
        stream={stream}
        name={name}
        myVideo={myVideo}
        userVideo={userVideo}
        call={call}
        callAccepted={callAccepted}
        callEnded={callEnded}
        muted={muted}
      />
      <Options
        mySocket={mySocket}
        callAccepted={callAccepted}
        callEnded={callEnded}
        leaveCall={leaveCall}
        callUser={callUser}
        muted={muted}
        toggleMuted={toggleMuted}>
        <IncomingCall answerCall={answerCall} call={call} callAccepted={callAccepted} />
      </Options>
    </div>
  );
};

export default CallPage;
