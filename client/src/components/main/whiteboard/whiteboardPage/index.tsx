import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import { addWhiteboard, getWhiteboardsByOwner } from '../../../../services/whiteboardService';
import UserContext from '../../../../contexts/UserContext';
import { Whiteboard } from '../../../../types/types';
import BLANK_CANVAS from '../starting_canvas';

const WhiteboardPage = () => {
  const user = useContext(UserContext);
  const [title, SetTitle] = useState<string>('');
  const [accessType, setAccessType] = useState<string>('editable');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [joinId, setJoinId] = useState<string>('');
  const navigate = useNavigate();
  const [ownedWhiteboards, setOwnedWhiteboards] = useState<Whiteboard[]>([]);

  useEffect(() => {
    if (user?.user.username) {
      const fetchWhiteboards = async () => {
        const fetchedWhiteboard = await getWhiteboardsByOwner(user?.user.username);
        if (fetchedWhiteboard) {
          setOwnedWhiteboards(fetchedWhiteboard);
        }
      };
      fetchWhiteboards();
    }
  }, [user]);

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
    <div className='whiteboard-container m-4'>
      <h1 className='text-2xl font-bold'>Whiteboard Page</h1>
      <div
        className={`flex gap-4 ${isCreating ? 'flex-row-reverse justify-end' : 'flex-row justify-start'}`}>
        {!isCreating && !isJoining && (
          <button className='btn-create-whiteboard' onClick={() => setIsCreating(!isCreating)}>
            Start Creating Whiteboard
          </button>
        )}
        {isCreating && (
          <div className='flex gap-4'>
            <button className='btn-create-whiteboard' onClick={handleCreateWhiteboard}>
              Create Whiteboard
            </button>
            <button
              className='bg-red-500 py-2 px-4 rounded-md text-white'
              onClick={() => setIsCreating(!isCreating)}>
              X
            </button>
          </div>
        )}
        {isCreating && (
          <div className='horizontal-flex gap-2'>
            <p>Title: </p>
            <input
              type='text'
              value={title}
              onChange={e => SetTitle(e.target.value)}
              className='border border-black'
            />
            <p>Read-only?: </p>
            <input
              type='checkbox'
              value={accessType}
              onChange={e => {
                setAccessType(e.target.checked ? 'read-only' : 'editable');
              }}
              className='border border-black'
            />
          </div>
        )}
        {!isJoining && !isCreating && (
          <button className='btn-create-whiteboard' onClick={() => setIsJoining(!isJoining)}>
            Join Whiteboard
          </button>
        )}
        {isJoining && (
          <div className='horizontal-flex gap-4'>
            <p>Whiteboard ID: </p>
            <input
              type='text'
              value={joinId}
              onChange={e => setJoinId(e.target.value)}
              className='border border-black'
            />
          </div>
        )}
        {isJoining && (
          <div>
            <button
              className='btn-create-whiteboard'
              onClick={() => navigate(`/whiteboard/${joinId}`)}>
              Join Whiteboard
            </button>
            <button
              className='bg-red-500 py-2 px-4 rounded-md text-white'
              onClick={() => setIsJoining(!isJoining)}>
              X
            </button>
          </div>
        )}
      </div>
      <div>
        {ownedWhiteboards.length && <p className='font-semibold text-lg'>My Whiteboards</p>}
        <ul>
          {ownedWhiteboards.map((whiteboard, index) => (
            <div className='horizontal-flex justify-between w-[30%]' key={index}>
              <p>{whiteboard.title}</p>
              <button
                className='btn-create-whiteboard'
                onClick={() => navigate(`/whiteboard/${whiteboard.uniqueLink}`)}>
                Join
              </button>
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WhiteboardPage;
