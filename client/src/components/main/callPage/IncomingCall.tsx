import { CallType } from '../../../hooks/useCallPage';

type IncomingCallProps = {
  answerCall: () => void;
  call: CallType;
  callAccepted: boolean;
};

const Notifications = ({ answerCall, call, callAccepted }: IncomingCallProps) => (
  <div className='border border-gren-400'>
    {call.isReceivedCall && !callAccepted && (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <h1>{call.name} is calling: </h1>
        <button onClick={answerCall}>Answer</button>
      </div>
    )}
  </div>
);

export default Notifications;
