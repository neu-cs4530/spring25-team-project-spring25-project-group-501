import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeHigh, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';
import { CallableUser } from './type';

type OptionsProps = {
  mySocket: string;
  callAccepted: boolean;
  callEnded: boolean;
  leaveCall: () => void;
  callUser: (id: string) => void;
  callableUsers: CallableUser[];
  muted: boolean;
  toggleMuted: () => void;
  videoOff: boolean;
  toggleVideo: () => void;
  toggleCallableUsers: () => void;
  children: React.ReactNode;
};

const Options = (props: OptionsProps) => {
  const [idToCall, setIdToCall] = useState('');

  return (
    <div className='my-2'>
      <form className='min-w-full flex flex-row items-center justify-start flex-wrap'>
        <div>
          <p className='font-bold'>Controls</p>
          <div className='bg-[#9290C3] rounded-lg py-2 px-3 flex items-center justify-center min-h-full border border-black'>
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
              className='bg-blue-500 hover:bg-blue-700 active:to-blue-900 text-white font-bold py-2 rounded w-12'>
              {props.muted ? (
                <FontAwesomeIcon icon={faVolumeHigh} />
              ) : (
                <FontAwesomeIcon icon={faVolumeXmark} />
              )}
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
          <div className='border border-black bg-[#9290C3] rounded-lg py-2 px-3 gap-2 flex flex-row items-center justify-center'>
            <select
              value={idToCall}
              onChange={e => {
                setIdToCall(e.target.value);
              }}
              onClick={props.toggleCallableUsers}
              className='p-2 rounded-lg outline'>
              <option value=''>Select a user</option>
              {props.callableUsers.map((user: CallableUser) => (
                <option key={user.socketId} value={user.socketId}>
                  {user.username}
                </option>
              ))}
            </select>
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
