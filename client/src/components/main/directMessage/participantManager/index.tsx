import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield, faUserCog, faUser } from '@fortawesome/free-solid-svg-icons';
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

  // Helper function to get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <FontAwesomeIcon icon={faUserShield} className='role-icon admin' />;
      case 'moderator':
        return <FontAwesomeIcon icon={faUserCog} className='role-icon moderator' />;
      default:
        return <FontAwesomeIcon icon={faUser} className='role-icon user' />;
    }
  };

  return (
    <div className='participant-manager-container'>
      {error && (
        <div className='error-message'>
          <p>{error}</p>
        </div>
      )}

      {currentUserPermission !== 'admin' ? (
        <div className='permission-notice'>
          <p>Only administrators can manage user permissions</p>
        </div>
      ) : (
        <>
          <div className='current-participants'>
            <h3>Current Participants</h3>
            <div className='participants-list'>
              {chat.participants.map(username => {
                const permission = chat.permissions.find(p => p.user === username)?.role || 'user';
                return (
                  <div
                    key={username}
                    className={`participant-row ${username === selectedUser ? 'selected' : ''} ${username === user.username ? 'current-user' : ''}`}
                    onClick={() => username !== user.username && setSelectedUser(username)}>
                    <div className='participant-info'>
                      <span className='participant-name'>{username}</span>
                      <div className='participant-role'>
                        {getRoleIcon(permission)}
                        <span>{permission.charAt(0).toUpperCase() + permission.slice(1)}</span>
                      </div>
                    </div>
                    {username === user.username && <span className='current-user-tag'>You</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className='permission-form'>
            <h3>Change User Permission</h3>

            <div className='form-row'>
              <div className='form-group'>
                <label htmlFor='userSelect'>Selected User</label>
                <select
                  id='userSelect'
                  className='form-select'
                  value={selectedUser}
                  onChange={e => setSelectedUser(e.target.value)}>
                  <option value=''>-- Select a user --</option>
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
                <label htmlFor='permissionSelect'>New Role</label>
                <select
                  id='permissionSelect'
                  className='form-select'
                  value={newPermission}
                  onChange={e => setNewPermission(e.target.value as Role)}
                  disabled={!selectedUser}>
                  <option value='user'>User</option>
                  <option value='moderator'>Moderator</option>
                  <option value='admin'>Admin</option>
                </select>
              </div>
            </div>

            <div className='form-actions'>
              <button
                className='update-button'
                disabled={!selectedUser || !newPermission}
                onClick={() => {
                  if (selectedUser && newPermission) {
                    handleChangeUserPermission(selectedUser, newPermission);
                    // Reset selection after update
                    setSelectedUser('');
                  }
                }}>
                Update Permission
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ParticipantManager;
