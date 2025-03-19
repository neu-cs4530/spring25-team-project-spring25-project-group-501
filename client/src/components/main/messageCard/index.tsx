import React from 'react';
import './index.css';
import { DatabaseMessage } from '@fake-stack-overflow/shared';
import { ObjectId } from 'mongodb';
import { getMetaData } from '../../../tool';

interface MessageCardProps {
  message: DatabaseMessage;
  canDelete?: boolean;
  onDelete?: (id: ObjectId) => void;
}

/**
 * MessageCard component displays a single message with its sender, time, and (optionally) a delete button.
 *
 * @param message: The message object to display.
 * @param canDelete: Flag indicating if the user can delete the message.
 * @param onDelete: Callback function to execute deletion.
 */
const MessageCard = ({ message, canDelete = false, onDelete }: MessageCardProps) => {
  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(message._id);
    }
  };

  return (
    <div className='message'>
      <div className='message-header'>
        <div className='message-sender'>{message.msgFrom}</div>
        {canDelete && (
          <button className='delete-message-button' onClick={handleDeleteClick}>
            <i className='fas fa-trash-alt'></i>
          </button>
        )}
        <div className='message-time'>{getMetaData(new Date(message.msgDateTime))}</div>
      </div>
      <div className='message-body'>{message.msg}</div>
    </div>
  );
};

export default MessageCard;
