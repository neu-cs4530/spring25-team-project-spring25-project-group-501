// First, let's update your Notification component to work with your chat data structure
// notification.tsx
import React, { useEffect } from 'react';
import { PopulatedDatabaseChat } from '@fake-stack-overflow/shared';
import { useNavigate } from 'react-router-dom';
import './index.css';

interface NotificationProps {
  chat: PopulatedDatabaseChat;
  onDismiss: () => void;
  autoDisappear?: number;
}

const Notification: React.FC<NotificationProps> = ({
  chat,
  onDismiss,
  autoDisappear = 10000, // Auto-dismiss after 10 seconds by default
}) => {
  const navigate = useNavigate();

  // Get the last message from the chat
  const lastMessage = chat.messages[chat.messages.length - 1];

  useEffect(() => {
    // Auto-dismiss after specified time if autoDisappear is provided
    const timer = setTimeout(() => {
      onDismiss();
    }, autoDisappear);

    return () => clearTimeout(timer);
  }, [onDismiss, autoDisappear]);

  // Handle click to navigate to the message
  const handleNotificationClick = () => {
    navigate(`/messaging/direct-message?chatId=${chat._id}`);
    onDismiss();
  };

  return (
    <div className='notification-container'>
      <div className='notification' onClick={handleNotificationClick}>
        <div className='notification-content'>
          <div className='notification-header'>
            <span className='notification-sender'>{lastMessage.msgFrom}</span>
            <span className='notification-timestamp'>
              {new Date(lastMessage.msgDateTime).toLocaleTimeString()}
            </span>
          </div>
          <div className='notification-text'>{lastMessage.msg}</div>
          <div className='notification-chat-room'>
            {chat.participants.length > 2 ? `Group: ${chat.title}` : 'Direct Message'}
          </div>
        </div>
      </div>
      <button className='notification-dismiss' onClick={onDismiss}>
        <i className='fa-solid fa-x'></i>
      </button>
    </div>
  );
};

export default Notification;
