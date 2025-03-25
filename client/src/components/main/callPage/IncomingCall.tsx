import { CallType } from '../../../hooks/useCallPage';

type IncomingCallProps = {
  answerCall: () => void;
  call: CallType;
  callAccepted: boolean;
};

const Notifications = ({ answerCall, call, callAccepted }: IncomingCallProps) => (
  <div>
    {call.isReceivedCall && !callAccepted && (
      <div className='flex items-center justify-center border border-black my-2 bg-orange-200 rounded-lg p-4'>
        <h4 className='text-lg italic'>{call.name} is calling: </h4>
        <button
          onClick={answerCall}
          className='bg-blue-500 hover:bg-blue-700 active:to-blue-900 text-white font-bold py-2 px-4 rounded'>
          Answer
        </button>
      </div>
    )}
  </div>
);

export default Notifications;
