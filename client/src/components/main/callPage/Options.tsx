import React, { PropsWithChildren, useState } from 'react';

type OptionsProps = {
  mySocket: string;
  callAccepted: boolean;
  callEnded: boolean;
  leaveCall: () => void;
  callUser: (id: string) => void;
  children: React.ReactNode;
};

const Options = (props: OptionsProps) => {
  const [idToCall, setIdToCall] = useState('');

  return (
    <div className='border border-blue-400'>
      <form>
        <div>
          <div>
            <h3>Account Info</h3>
            <button
              onClick={e => {
                e.preventDefault();
                navigator.clipboard.writeText(props.mySocket);
              }}>
              Copy Your ID
            </button>
          </div>

          <div>
            <h3>Make a call</h3>
            <input
              type='text'
              value={idToCall}
              onChange={e => setIdToCall(e.target.value)}
              placeholder='ID to call'
            />
            {props.callAccepted && !props.callEnded ? (
              <button
                onClick={e => {
                  e.preventDefault();
                  props.leaveCall();
                }}>
                Hang Up
              </button>
            ) : (
              <button
                onClick={e => {
                  e.preventDefault();
                  props.callUser(idToCall);
                }}>
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
