import React from 'react';
import './index.css';
import { DatabaseMessage } from '@fake-stack-overflow/shared';
import { ObjectId } from 'mongodb';
import { getMetaData } from '../../../tool';

interface MessageCardProps {
  message: DatabaseMessage;
  canDelete?: boolean;
  onDelete?: (id: ObjectId) => void;
  onVote?: (messageId: string, optionIndex: number) => void;
  currentUser?: string;
}

/**
 * MessageCard displays a single message with its sender, time, and optionally a delete button.
 * If the message is a poll, it displays the poll question, options and vote counts.
 */
const MessageCard = ({
  message,
  canDelete = false,
  onDelete,
  onVote,
  currentUser,
}: MessageCardProps) => {
  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(message._id);
    }
  };

  // Render a poll if the message type is "poll"
  const renderPoll = () => {
    if (!message.poll) {
      return null;
    }

    // Initialize vote counts for each option.
    const voteCounts: number[] = new Array(message.poll.options.length).fill(0);
    let currentUserVote: number | null = null;
    if (message.poll.votes) {
      Object.entries(message.poll.votes).forEach(([voter, vote]) => {
        voteCounts[vote] = (voteCounts[vote] || 0) + 1;
        if (currentUser && voter === currentUser) {
          currentUserVote = vote;
        }
      });
    }
    return (
      <div className='poll-container'>
        <div className='poll-question'>{message.poll.question}</div>
        <div className='poll-options'>
          {message.poll.options.map((option, index) => (
            <button
              key={index}
              className={`poll-option-button ${currentUserVote === index ? 'voted' : ''}`}
              onClick={() => onVote && onVote(message._id.toString(), index)}>
              {option.optionText}
              <span className='vote-count'>
                ({voteCounts[index]} -{' '}
                {((voteCounts[index] / voteCounts.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)
              </span>
            </button>
          ))}
        </div>
      </div>
    );
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
      <div className='message-body'>{message.type === 'poll' ? renderPoll() : message.msg}</div>
    </div>
  );
};

export default MessageCard;
