import { FakeSOSocket } from '../types/types';

const callController = (socket: FakeSOSocket) => {
  // socket.on('connection', conn => {
  //   conn.on('callUser', ({ userToCall, signalData, from, name }) => {
  //     conn.to(userToCall).emit('callUser', { signal: signalData, from, name });
  //   });
  //   conn.on('answerCall', ({ to, signal }) => {
  //     conn.to(to).emit('callAccepted', signal);
  //   });
  // });
};

export default callController;
