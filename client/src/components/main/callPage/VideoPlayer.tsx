import { useEffect } from 'react';
import { CallType } from '../../../hooks/useCallPage';

type VideoPlayerType = {
  stream: MediaStream | undefined;
  name: string;
  myVideo: React.MutableRefObject<HTMLVideoElement | null>;
  userVideo: React.MutableRefObject<HTMLVideoElement | null>;
  call: CallType;
  callAccepted: boolean;
  callEnded: boolean;
  muted: boolean;
  videoOff: boolean;
};

const VideoPlayer = ({
  stream,
  name,
  myVideo,
  userVideo,
  call,
  callAccepted,
  callEnded,
  muted,
  videoOff,
}: VideoPlayerType) => {
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: !videoOff, audio: true }).then(currentStream => {
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
    });
  }, [myVideo, stream, muted, videoOff]);

  return (
    <div className='grid grid-cols-2 gap-4 w-full'>
      {/* Our own video */}
      {stream && (
        <div>
          <h3 className='text-xl underline'>My Video {name ? `- ${name}` : ''}</h3>
          <video
            muted
            ref={myVideo}
            autoPlay
            playsInline
            id='myVideo'
            style={{ transform: 'scaleX(-1)' }}
            className='border-2 border-blue-700 rounded-lg bg-black'
          />
        </div>
      )}

      {/* Other User's video */}
      {callAccepted && !callEnded && (
        <div>
          <h3 className='text-xl underline'>{`${call.name || 'Other User'}'s Video`}</h3>
          <video
            ref={userVideo}
            autoPlay
            playsInline
            style={{ transform: 'scaleX(-1)' }}
            className='border-2 border-red-700 rounded-lg'
          />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
