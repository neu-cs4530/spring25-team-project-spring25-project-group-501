import React from 'react';
import './index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUsers, faCog, faPoll } from '@fortawesome/free-solid-svg-icons';
import useDirectMessage from '../../../hooks/useDirectMessage';
import ChatsListCard from './chatsListCard';
import UsersListPage from '../usersListPage';
import MessageCard from '../messageCard';
import Modal from './modal';
import ParticipantManager from './participantManager';
import useUserContext from '../../../hooks/useUserContext';
import CreatePollModal from './poll';

const DirectMessage = () => {
  const {
    selectedChat,
    selectedParticipants,
    chats,
    newMessage,
    setNewMessage,
    showCreatePanel,
    setShowCreatePanel,
    handleSendMessage,
    handleChatSelect,
    handleUserSelect,
    handleCreateChat,
    error,
    showAddParticipants,
    setShowAddParticipants,
    selectedUsersToAdd,
    handleSelectedUsersToAdd,
    handleAddSelectedUsers,
    showManageParticipants,
    setShowManageParticipants,
    handleDeleteMessage,
    showUsersList,
    setShowUsersList,
    newChatTitle,
    setNewChatTitle,
    showCreatePoll,
    setShowCreatePoll,
    handleVoteOnPoll,
    handleCreatePoll,
  } = useDirectMessage();

  const { user } = useUserContext();
  let userPermissions = 'user';

  if (selectedChat) {
    userPermissions =
      selectedChat.permissions.find(permission => permission.user === user.username)?.role ||
      'user';
  }

  return (
    <>
      <div className='direct-message-container'>
        <div className='chats-list'>
          <div className='chats-header'>
            <h2>Your Chats</h2>
            <button
              className='icon-button'
              title='Start a new chat'
              onClick={() => setShowCreatePanel(true)}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
          <div className='chats-content'>
            {chats.map(chat => (
              <ChatsListCard
                key={String(chat._id)}
                chat={chat}
                handleChatSelect={handleChatSelect}
              />
            ))}
          </div>
        </div>
        <div className='chat-container'>
          {selectedChat ? (
            <>
              <div className='chat-header'>
                <h2>{selectedChat.title}</h2>
                <div className='chat-actions'>
                  <button
                    className='icon-button'
                    title='Add Participants'
                    onClick={() => setShowAddParticipants(true)}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                  <button
                    className='icon-button'
                    title='Show Participants'
                    onClick={() => setShowUsersList(true)}>
                    <FontAwesomeIcon icon={faUsers} />
                  </button>
                  {userPermissions === 'admin' && (
                    <button
                      className='icon-button'
                      title='Manage Participants'
                      onClick={() => setShowManageParticipants(true)}>
                      <FontAwesomeIcon icon={faCog} />
                    </button>
                  )}
                  <button
                    className='icon-button'
                    title='Create Poll'
                    onClick={() => setShowCreatePoll(true)}>
                    <FontAwesomeIcon icon={faPoll} />
                  </button>
                </div>
              </div>
              <div className='chat-messages'>
                {selectedChat.messages.map(message => (
                  <MessageCard
                    key={String(message._id)}
                    message={message}
                    canDelete={
                      userPermissions === 'admin' ||
                      userPermissions === 'moderator' ||
                      message.msgFrom === user.username
                    }
                    onDelete={() => handleDeleteMessage(userPermissions, message._id)}
                    onVote={handleVoteOnPoll}
                    currentUser={user.username}
                  />
                ))}
              </div>
              <div className='message-input'>
                <input
                  className='custom-input'
                  type='text'
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder='Type a message...'
                />
                <button className='custom-button' onClick={handleSendMessage}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className='no-chat-selected'>
              <h2>Select a chat or start a new conversation</h2>
              <button className='custom-button' onClick={() => setShowCreatePanel(true)}>
                Start a New Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Chat Modal */}
      <Modal isOpen={showCreatePanel} onClose={() => setShowCreatePanel(false)}>
        <div className='create-chat-modal'>
          <h2>Start a New Chat</h2>
          {error && <div className='direct-message-error'>{error}</div>}

          <div className='selected-participants'>
            <h3>Selected Users</h3>
            {selectedParticipants.length > 0 ? (
              <p>{selectedParticipants.join(', ')}</p>
            ) : (
              <p className='no-selection'>No users selected yet</p>
            )}
          </div>

          {selectedParticipants.length > 1 && (
            <div className='form-group'>
              <label htmlFor='chat-title'>Group Chat Name</label>
              <input
                id='chat-title'
                className='custom-input'
                type='text'
                value={newChatTitle}
                onChange={e => setNewChatTitle(e.target.value)}
                placeholder='Enter a name for this group chat'
              />
            </div>
          )}

          <div className='scrollable-container'>
            <h3>Select Users</h3>
            <UsersListPage handleUserSelect={handleUserSelect} />
          </div>

          <div className='modal-actions'>
            <button className='custom-button cancel' onClick={() => setShowCreatePanel(false)}>
              Cancel
            </button>
            <button
              className='custom-button primary'
              onClick={handleCreateChat}
              disabled={selectedParticipants.length === 0}>
              Create Chat
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Participants Modal */}
      <Modal isOpen={showAddParticipants} onClose={() => setShowAddParticipants(false)}>
        <div className='add-participants-modal'>
          <h2>Add Users to Chat</h2>
          <div className='selected-participants'>
            <h3>Selected Users</h3>
            {selectedUsersToAdd.length > 0 ? (
              <p>{selectedUsersToAdd.join(', ')}</p>
            ) : (
              <p className='no-selection'>No users selected yet</p>
            )}
          </div>

          <div className='scrollable-container'>
            <UsersListPage handleUserSelect={handleSelectedUsersToAdd} />
          </div>

          <div className='modal-actions'>
            <button className='custom-button cancel' onClick={() => setShowAddParticipants(false)}>
              Cancel
            </button>
            <button
              className='custom-button primary'
              onClick={handleAddSelectedUsers}
              disabled={selectedUsersToAdd.length === 0}>
              Add Selected Users
            </button>
          </div>
        </div>
      </Modal>

      {/* Other Modals */}
      {selectedChat && (
        <>
          <Modal isOpen={showManageParticipants} onClose={() => setShowManageParticipants(false)}>
            <h2>Manage Participants</h2>
            <ParticipantManager chat={selectedChat} />
          </Modal>

          <Modal isOpen={showUsersList} onClose={() => setShowUsersList(false)}>
            <div className='participants-list-modal'>
              <h2>Chat Participants</h2>
              <p className='participant-count'>Total: {selectedChat.participants.length}</p>
              <div className='scrollable-container'>
                <ul className='participants-list'>
                  {selectedChat.participants.map(participant => {
                    const permission = selectedChat.permissions.find(p => p.user === participant);
                    return (
                      <li key={participant} className='participant-item'>
                        <span className='participant-name'>{participant}</span>
                        <span className='participant-role'>
                          {permission ? permission.role : 'user'}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </Modal>

          <CreatePollModal
            isOpen={showCreatePoll}
            onClose={() => setShowCreatePoll(false)}
            onSubmit={handleCreatePoll}
          />
        </>
      )}
    </>
  );
};

export default DirectMessage;
