import React from 'react';
import './index.css';
import useDirectMessage from '../../../hooks/useDirectMessage';
import ChatsListCard from './chatsListCard';
import UsersListPage from '../usersListPage';
import MessageCard from '../messageCard';
import Modal from './modal'; // Adjust the import path as needed

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
  } = useDirectMessage();

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
                <h2>Chat Participants: {selectedChat.participants.join(', ')}</h2>
                <button className='custom-button' onClick={() => setShowAddParticipants(true)}>
                  Add Participants
                </button>
              </span>
              <div className='chat-messages'>
                {selectedChat.messages.map(message => (
                  <MessageCard key={String(message._id)} message={message} />
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
            <h2>Select a user to start chatting</h2>
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
    </>
  );
};

export default DirectMessage;
