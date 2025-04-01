import React, { useState } from 'react';

type OptionsProps = {
  mySocket: string;
  callAccepted: boolean;
  callEnded: boolean;
  leaveCall: () => void;
  callUser: (id: string) => void;
  muted: boolean;
  toggleMuted: () => void;
  videoOff: boolean;
  toggleVideo: () => void;
  children: React.ReactNode;
};

const Options = (props: OptionsProps) => {
  const [idToCall, setIdToCall] = useState('');

  return (
    <div className='my-2'>
      <form className='min-w-full flex flex-row items-center justify-start flex-wrap'>
        <div>
          <p className='font-bold'>Controls</p>
          <div className='bg-slate-100 rounded-lg py-2 px-3 flex items-center justify-center min-h-full border border-black'>
            <button
              onClick={e => {
                e.preventDefault();
                navigator.clipboard.writeText(props.mySocket);
              }}
              className='bg-blue-500 hover:bg-blue-700 active:to-blue-900 text-white font-bold py-2 px-4 rounded'>
              Copy Your ID
            </button>
            <button
              onClick={e => {
                e.preventDefault();
                props.toggleMuted();
              }}
              className='bg-blue-500 hover:bg-blue-700 active:to-blue-900 text-white font-bold py-2 px-4 rounded'>
              {props.muted ? '📳 Unmute' : '📴 Mute'}
            </button>
            <button
              onClick={e => {
                e.preventDefault();
                props.toggleVideo();
              }}
              className='bg-blue-500 hover:bg-blue-700 active:to-blue-900 text-white font-bold py-2 px-4 rounded'>
              {props.videoOff ? 'Enable Video' : 'Disable Video'}
            </button>
          </div>
        </div>

        <div>
          <p className='font-bold'>Make a Call</p>
          <div className='border border-black bg-slate-100 rounded-lg py-2 px-3 gap-2 flex flex-row items-center justify-center'>
            <input
              type='text'
              value={idToCall}
              onChange={e => setIdToCall(e.target.value)}
              placeholder='ID to call'
              className='p-2 rounded-lg outline'
            />
            {props.callAccepted && !props.callEnded ? (
              <button
                onClick={e => {
                  e.preventDefault();
                  props.leaveCall();
                }}
                className='bg-red-500 hover:bg-red-700 active:to-red-900 text-white font-bold py-2 px-4 rounded min-w-32'>
                Hang Up
              </button>
            ) : (
              <button
                onClick={e => {
                  e.preventDefault();
                  props.callUser(idToCall);
                }}
                className='bg-blue-500 hover:bg-blue-700 active:to-blue-900 text-white font-bold py-2 px-4 rounded min-w-32'>
                Call
              </button>
            )}
          </div>
        </div>
      </form>
      {props.children}
    </div>
  );
};

export default Options;
