import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import { addWhiteboard } from '../../../../services/whiteboardService';
import UserContext from '../../../../contexts/UserContext';
import BLANK_CANVAS from '../starting_canvas';

const WhiteboardPage = () => {
  const user = useContext(UserContext);
  const [title, SetTitle] = useState<string>('');
  const [accessType, setAccessType] = useState<string>('editable');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [joinId, setJoinId] = useState<string>('');
  const navigate = useNavigate();

  const handleCreateWhiteboard = async () => {
    if (!user) return;
    const dateCreated = new Date();
    const uniqueLink = crypto.randomUUID();
    const content: string = BLANK_CANVAS;

    const whiteboard = await addWhiteboard(
      user.user.username,
      title,
      dateCreated,
      content,
      uniqueLink,
      accessType,
    );

    if (whiteboard) {
      navigate(`/whiteboard/${uniqueLink}`);
    }
  };

  return (
    <div className='whiteboard-container'>
      <div className='horizontal-flex'>
        {!isCreating && (
          <button className='btn-create-whiteboard' onClick={() => setIsCreating(!isCreating)}>
            Start Creating Whiteboard
          </button>
        )}
        {isCreating && (
          <button className='btn-create-whiteboard' onClick={handleCreateWhiteboard}>
            Create Whiteboard
          </button>
        )}
        {isCreating && (
          <div className='horizontal-flex'>
            <p>Title: </p>
            <input type='text' value={title} onChange={e => SetTitle(e.target.value)}></input>
            <p>Read-only?: </p>
            <input
              type='checkbox'
              value={accessType}
              onChange={e => {
                setAccessType(e.target.checked ? 'read-only' : 'editable');
              }}
            />
          </div>
        )}
        {!isJoining && (
          <button className='btn-create-whiteboard' onClick={() => setIsJoining(!isJoining)}>
            Join Whiteboard
          </button>
        )}
        {isJoining && (
          <div className='horizontal-flex'>
            <p>Whiteboard ID: </p>
            <input type='text' value={joinId} onChange={e => setJoinId(e.target.value)}></input>
          </div>
        )}
        {isJoining && (
          <button
            className='btn-create-whiteboard'
            onClick={() => navigate(`/whiteboard/${joinId}`)}>
            Join Whiteboard
          </button>
        )}
      </div>
    </div>
  );
};

export default WhiteboardPage;
