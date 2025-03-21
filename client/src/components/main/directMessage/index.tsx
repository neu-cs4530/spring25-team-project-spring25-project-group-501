import React from 'react';
import './index.css';
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
      <div className='create-panel'>
        <button className='custom-button' onClick={() => setShowCreatePanel(prev => !prev)}>
          {showCreatePanel ? 'Hide Create Chat Panel' : 'Start a Chat'}
        </button>
        {error && <div className='direct-message-error'>{error}</div>}
        {showCreatePanel && (
          <>
            <p>Selected users: {selectedParticipants.join(', ') || 'None'}</p>

            {selectedParticipants.length > 1 && (
              <input
                className='custom-input small-width'
                type='text'
                value={newChatTitle}
                onChange={e => setNewChatTitle(e.target.value)}
                placeholder='Enter group chat name'
              />
            )}
            <div></div>
            <button className='custom-button' onClick={handleCreateChat}>
              Create New Chat
            </button>

            <UsersListPage handleUserSelect={handleUserSelect} />
          </>
        )}
      </div>
      <div className='direct-message-container'>
        <div className='chats-list'>
          {chats.map(chat => (
            <ChatsListCard key={String(chat._id)} chat={chat} handleChatSelect={handleChatSelect} />
          ))}
        </div>
        <div className='chat-container'>
          {selectedChat ? (
            <>
              <span>
                <h2>{selectedChat.title}</h2>
                <button className='custom-button' onClick={() => setShowAddParticipants(true)}>
                  Add Participants
                </button>
                <button className='custom-button' onClick={() => setShowUsersList(true)}>
                  Show Participants
                </button>
                {userPermissions === 'admin' && (
                  <button className='custom-button' onClick={() => setShowManageParticipants(true)}>
                    Manage Participants
                  </button>
                )}
                <button className='custom-button' onClick={() => setShowCreatePoll(true)}>
                  Create Poll
                </button>
              </span>
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
            <h2>Select a user or users to start chatting</h2>
          )}
        </div>
      </div>
      <Modal isOpen={showAddParticipants} onClose={() => setShowAddParticipants(false)}>
        <h3>Select Users to Add</h3>
        <p>Selected users: {selectedUsersToAdd.join(', ') || 'None'}</p>
        <div className='scrollable-container'>
          <UsersListPage handleUserSelect={handleSelectedUsersToAdd} />
        </div>
        <div className='modal-actions'>
          <button className='custom-button' onClick={handleAddSelectedUsers}>
            Add Selected Users
          </button>
          <button className='custom-button' onClick={() => setShowAddParticipants(false)}>
            Cancel
          </button>
        </div>
      </Modal>
      {selectedChat && (
        <>
          <Modal isOpen={showManageParticipants} onClose={() => setShowManageParticipants(false)}>
            <ParticipantManager chat={selectedChat} />
          </Modal>
          <Modal isOpen={showUsersList} onClose={() => setShowUsersList(false)}>
            <div className='scrollable-container'>
              <h3>Chat Participants ({selectedChat.participants.length})</h3>
              <ul>
                {selectedChat.participants.map(participant => {
                  const permission = selectedChat.permissions.find(p => p.user === participant);
                  return (
                    <li key={participant}>
                      {participant} - {permission ? permission.role : 'user'}
                    </li>
                  );
                })}
              </ul>
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
