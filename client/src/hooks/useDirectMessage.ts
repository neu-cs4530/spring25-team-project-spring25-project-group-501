import { ObjectId } from 'mongodb';
import { useEffect, useState } from 'react';
import {
  ChatUpdatePayload,
  Message,
  PopulatedDatabaseChat,
  SafeDatabaseUser,
} from '../types/types';
import useUserContext from './useUserContext';
import {
  createChat,
  getChatById,
  getChatsByUser,
  sendMessage,
  addParticipantToChat,
  deleteChatMessage,
  sendPoll,
} from '../services/chatService';
import { voteOnPoll } from '../services/messageService';
/**
 * useDirectMessage is a custom hook that provides state and functions for direct messaging between two users or a group of users.
 * It includes a selected user, messages, and a new message state.
 */

const useDirectMessage = () => {
  const { user, socket } = useUserContext();
  const [showCreatePanel, setShowCreatePanel] = useState<boolean>(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [selectedChat, setSelectedChat] = useState<PopulatedDatabaseChat | null>(null);
  const [chats, setChats] = useState<PopulatedDatabaseChat[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showAddParticipants, setShowAddParticipants] = useState(false);
  const [selectedUsersToAdd, setSelectedUsersToAdd] = useState<string[]>([]);
  const [showManageParticipants, setShowManageParticipants] = useState(false);
  const [showUsersList, setShowUsersList] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [showCreatePoll, setShowCreatePoll] = useState<boolean>(false);

  const handleJoinChat = (chatID: ObjectId) => {
    socket.emit('joinChat', String(chatID));
  };

  /**
   * Handle voting on a poll message.
   * @param messageID - The poll message ID to vote on.
   * @param optionIndex - The index of the option that the user voted for.
   */
  const handleVoteOnPoll = async (messageID: string, optionIndex: number) => {
    if (!user?.username || !selectedChat) return; // Ensure user context is available and a chat is selected
    try {
      await voteOnPoll(selectedChat._id.toString(), messageID, optionIndex, user.username);
      const chat = await getChatById(selectedChat._id);
      setSelectedChat(chat);
      setError(null);
    } catch (err: unknown) {
      /* empty */
    }
  };

  /**
   * Handle creating a poll and sending it to the backend.
   */
  const handleCreatePoll = async (pollData: { question: string; options: string[] }) => {
    if (!user?.username || !selectedChat) return;

    // Build the poll message object.
    const votes: Map<string, number> = new Map();
    const pollMessage: Message = {
      msg: 'POLL',
      msgFrom: user.username,
      msgDateTime: new Date(),
      type: 'poll',
      poll: {
        question: pollData.question,
        options: pollData.options.map(optionText => ({ optionText })),
        votes,
      },
    };

    try {
      // sendPoll should be your service function that sends polls
      await sendPoll(pollMessage, selectedChat._id);
      const chat = await getChatById(selectedChat._id);
      // Update the selected chat with the new poll message
      setSelectedChat(chat);
      setShowCreatePoll(false);
      setError(null);
    } catch (err: unknown) {
      setError('Failed to create poll. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedChat?._id) {
      const message: Message = {
        msg: newMessage,
        msgFrom: user.username,
        msgDateTime: new Date(),
        type: 'direct',
      };

      const chat = await sendMessage(message, selectedChat._id);

      setSelectedChat(chat);
      setError(null);
      setNewMessage('');
    } else {
      setError('Message cannot be empty');
    }
  };

  const handleChatSelect = async (chatID: ObjectId | undefined) => {
    if (!chatID) {
      setError('Invalid chat ID');
      return;
    }

    const chat = await getChatById(chatID);
    setSelectedChat(chat);
    handleJoinChat(chatID);
  };

  const handleUserSelect = (selectedUser: SafeDatabaseUser) => {
    setSelectedParticipants(prev => {
      if (prev.includes(selectedUser.username)) {
        return prev.filter(username => username !== selectedUser.username);
      }
      return [...prev, selectedUser.username];
    });
  };

  const handleCreateChat = async () => {
    if (selectedParticipants.length === 0) {
      setError('Please select at least one user to chat with');
      return;
    }
    const allParticipants = [user.username, ...selectedParticipants];
    const chatName = newChatTitle || `Chat with ${allParticipants.join(', ')}`;
    const chat = await createChat(allParticipants, user.username, chatName);
    setSelectedChat(chat);
    handleJoinChat(chat._id);
    setSelectedParticipants([]);
    setShowCreatePanel(false);
  };

  const handleAddSelectedUsers = async () => {
    if (!selectedChat?._id) {
      setError('Invalid chat ID');
      return;
    }
    await Promise.all(
      selectedUsersToAdd.map(username => addParticipantToChat(selectedChat._id, username)),
    );

    const updatedChat = await getChatById(selectedChat._id);
    setSelectedChat(updatedChat);

    setShowAddParticipants(false);
    setSelectedUsersToAdd([]);
  };

  const handleSelectedUsersToAdd = (selectedUser: SafeDatabaseUser) => {
    setSelectedUsersToAdd(prev => {
      if (prev.includes(selectedUser.username)) {
        return prev.filter(username => username !== selectedUser.username);
      }
      return [...prev, selectedUser.username];
    });
  };

  const handleDeleteMessage = async (currentUserPermission: string, messageId: ObjectId) => {
    if (!selectedChat?._id) {
      setError('Invalid chat ID');
      return;
    }
    if (currentUserPermission !== 'moderator' && currentUserPermission !== 'admin') {
      setError('You do not have permission to delete messages.');
      return;
    }
    try {
      await deleteChatMessage(selectedChat._id, messageId);
      setError(null);
    } catch (err) {
      setError('Failed to delete message.');
    }
  };

  useEffect(() => {
    const fetchChats = async () => {
      const userChats = await getChatsByUser(user.username);
      setChats(userChats);
    };

    const handleChatUpdate = (chatUpdate: ChatUpdatePayload) => {
      const { chat, type } = chatUpdate;

      switch (type) {
        case 'created': {
          if (chat.participants.includes(user.username)) {
            setChats(prevChats => [chat, ...prevChats]);
          }
          return;
        }
        case 'newMessage':
        case 'deleted':
        case 'changeUserRole':
        case 'notification': {
          setSelectedChat(chat);
          return;
        }
        case 'newParticipant': {
          if (chat.participants.includes(user.username)) {
            setChats(prevChats => {
              if (prevChats.some(c => chat._id === c._id)) {
                return prevChats.map(c => (c._id === chat._id ? chat : c));
              }
              return [chat, ...prevChats];
            });
          }
          return;
        }
        default: {
          setError('Invalid chat update type');
        }
      }
    };

    fetchChats();

    socket.on('chatUpdate', handleChatUpdate);

    return () => {
      socket.off('chatUpdate', handleChatUpdate);
      socket.emit('leaveChat', String(selectedChat?._id));
    };
  }, [user.username, socket, selectedChat?._id]);

  return {
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
  };
};

export default useDirectMessage;
