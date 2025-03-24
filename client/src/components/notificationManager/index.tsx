import React, { useState, useEffect } from 'react';
import { ChatUpdatePayload, PopulatedDatabaseChat } from '@fake-stack-overflow/shared';
import { ObjectId } from 'mongodb';
import ReactDOM from 'react-dom';
import useUserContext from '../../hooks/useUserContext';
import { FakeSOSocket } from '../../types/types';
import Notification from './notification';

const NotificationManager = ({ socket }: { socket: FakeSOSocket | null }) => {
  const { user } = useUserContext();
  const [notifications, setNotifications] = useState<PopulatedDatabaseChat[]>([]);

  useEffect(() => {
    if (!socket) return () => {};

    // Listen for new message notifications
    const handleNewMessageNotification = (chatUpdate: ChatUpdatePayload) => {
      if (chatUpdate.type !== 'notification') return;
      const { chat } = chatUpdate;

      // Don't show notifications for messages from the current user
      if (
        chat.messages.length === 0 ||
        chat.messages[chat.messages.length - 1].msgFrom === user.username ||
        !chat.participants.includes(user.username)
      )
        return;

      // Add the new notification
      setNotifications(prevNotifications => [...prevNotifications, chat]);
    };

    // Subscribe to the chatUpdate event
    socket.on('chatUpdate', handleNewMessageNotification);

    return () => {
      socket.off('chatUpdate', handleNewMessageNotification);
    };
  }, [socket, user.username]);

  // Function to dismiss a notification
  const dismissNotification = (chatId: ObjectId) => {
    setNotifications(prev => prev.filter((chat: PopulatedDatabaseChat) => chat._id !== chatId));
  };

  return ReactDOM.createPortal(
    <div
      className='notifications-wrapper'
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 9999,
        maxWidth: '350px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
      {notifications.map(notification => (
        <Notification
          key={notification._id.toString()}
          chat={notification}
          onDismiss={() => dismissNotification(notification._id)}
        />
      ))}
    </div>,
    document.body, // Mounts the notifications outside the layout
  );
};

export default NotificationManager;
