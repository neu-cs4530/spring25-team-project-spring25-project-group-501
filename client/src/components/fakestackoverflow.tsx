import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout';
import Login from './auth/login';
import { FakeSOSocket, SafeDatabaseUser } from '../types/types';
import LoginContext from '../contexts/LoginContext';
import UserContext from '../contexts/UserContext';
import QuestionPage from './main/questionPage';
import TagPage from './main/tagPage';
import NewQuestionPage from './main/newQuestion';
import NewAnswerPage from './main/newAnswer';
import AnswerPage from './main/answerPage';
import MessagingPage from './main/messagingPage';
import DirectMessage from './main/directMessage';
import Signup from './auth/signup';
import UsersListPage from './main/usersListPage';
import ProfileSettings from './profileSettings';
import AllGamesPage from './main/games/allGamesPage';
import GamePage from './main/games/gamePage';
import WhiteboardPage from './main/whiteboard/whiteboardPage';
import SpecificWhiteboardPage from './main/whiteboard/specificWhiteboardPage';
import NotificationManager from './notificationManager';
import CallPage from './main/callPage';
import { updateUserSocket } from '../services/userService';

const ProtectedRoute = ({
  user,
  socket,
  children,
}: {
  user: SafeDatabaseUser | null;
  socket: FakeSOSocket | null;
  children: JSX.Element;
}) => {
  if (!user || !socket) {
    return <Navigate to='/' />;
  }

  return <UserContext.Provider value={{ user, socket }}>{children}</UserContext.Provider>;
};

/**
 * Represents the main component of the application.
 * It manages the state for search terms and the main title.
 */
const FakeStackOverflow = ({ socket }: { socket: FakeSOSocket | null }) => {
  const [user, setUser] = useState<SafeDatabaseUser | null>(null);

  useEffect(() => {
    if (socket && socket.id && user) {
      updateUserSocket(user.username, socket.id);
    }

    return () => {
      if (user) {
        updateUserSocket(user.username, undefined);
      }
    };
  }, [socket, user]);

  return (
    <LoginContext.Provider value={{ username: user?.username, setUser }}>
      <Routes>
        {/* Public Route */}
        <Route path='/' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        {/* Protected Routes */}
        {
          <Route
            element={
              <ProtectedRoute user={user} socket={socket}>
                <>
                  <NotificationManager socket={socket} />
                  <Layout />
                </>
              </ProtectedRoute>
            }>
            <Route path='/home' element={<QuestionPage />} />
            <Route path='tags' element={<TagPage />} />
            <Route path='/messaging' element={<MessagingPage />} />
            <Route path='/messaging/direct-message' element={<DirectMessage />} />
            <Route path='/question/:qid' element={<AnswerPage />} />
            <Route path='/new/question' element={<NewQuestionPage />} />
            <Route path='/new/answer/:qid' element={<NewAnswerPage />} />
            <Route path='/users' element={<UsersListPage />} />
            <Route path='/user/:username' element={<ProfileSettings />} />
            <Route path='/games' element={<AllGamesPage />} />
            <Route path='/games/:gameID' element={<GamePage />} />
            <Route path='/whiteboard' element={<WhiteboardPage />} />
            <Route path='/whiteboard/:whiteboardID' element={<SpecificWhiteboardPage />} />
            <Route path='/call' element={<CallPage />} />
          </Route>
        }
      </Routes>
    </LoginContext.Provider>
  );
};

export default FakeStackOverflow;
