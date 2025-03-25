import React, { useState } from 'react';
import useParticipantManager from '../../../../hooks/useParticipantManager';
import useUserContext from '../../../../hooks/useUserContext';
import { PopulatedDatabaseChat, Role } from '../../../../types/types';
import './index.css';

interface ParticipantManagerProps {
  chat: PopulatedDatabaseChat;
}

const ParticipantManager = ({ chat }: ParticipantManagerProps) => {
  const { user } = useUserContext();
  const currentUserPermission =
    chat.permissions.find(permission => permission.user === user.username)?.role || 'user';
  const { error, handleChangeUserPermission } = useParticipantManager(
    chat._id,
    currentUserPermission,
  );
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newPermission, setNewPermission] = useState<Role>('user');

  return (
    <div className='participant-manager'>
      {error && <div className='error'>{error}</div>}

      {currentUserPermission !== 'admin' && (
        <div className='permission-error'>Only Administrators can manage users.</div>
      )}

      {currentUserPermission === 'admin' && (
        <div className='permission-management'>
          <h3>Change User Permissions</h3>
          <div className='form-group'>
            <label htmlFor='userSelect'>Select User: </label>
            <select
              id='userSelect'
              className='select-input'
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}>
              <option value=''>--Select--</option>
              {chat.participants
                .filter(username => username !== user.username)
                .map(username => (
                  <option key={username} value={username}>
                    {username}
                  </option>
                ))}
            </select>
          </div>
          <div className='form-group'>
            <label htmlFor='newPermission'>New Permission: </label>
            <select
              id='newPermission'
              className='select-input'
              value={newPermission}
              onChange={e => setNewPermission(e.target.value as Role)}>
              <option value=''>--Select--</option>
              <option value='user'>User</option>
              <option value='moderator'>Moderator</option>
              <option value='admin'>Administrator</option>
            </select>
          </div>
          <button
            className='update-button'
            onClick={() => {
              if (selectedUser && newPermission) {
                handleChangeUserPermission(selectedUser, newPermission);
              }
            }}>
            Update Permission
          </button>
        </div>
      )}
    </div>
  );
};

export default ParticipantManager;
