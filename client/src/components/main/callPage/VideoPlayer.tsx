import { useEffect } from 'react';
import useCallPage, { CallType } from '../../../hooks/useCallPage';

type VideoPlayerType = {
  stream: MediaStream | undefined;
  name: string;
  myVideo: React.MutableRefObject<HTMLVideoElement | null>;
  userVideo: React.MutableRefObject<HTMLVideoElement | null>;
  call: CallType;
  callAccepted: boolean;
  callEnded: boolean;
};

const VideoPlayer = ({
  stream,
  name,
  myVideo,
  userVideo,
  call,
  callAccepted,
  callEnded,
}: VideoPlayerType) => {
  useEffect(() => {
    console.log(myVideo.current);
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(currentStream => {
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
    });
  }, [myVideo, stream]);

  return (
    <div className='border border-red-400'>
      {/* Our own video */}
      {stream && (
        <div>
          <h3>{name || 'Name'}</h3>
          <video
            muted
            ref={myVideo} // Connection between our stream and video component
            autoPlay
            playsInline
          />
        </div>
      )}

      {/* Other User's video */}
      <div>
        <h3>{call.name || 'Other user'}</h3>
        <video ref={userVideo} autoPlay playsInline />
      </div>
      {/* {callAccepted && !callEnded && (

      )} */}
    </div>
  );
};

export default VideoPlayer;
