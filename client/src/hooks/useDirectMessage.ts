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
} from '../services/chatService';

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

  const handleJoinChat = (chatID: ObjectId) => {
    socket.emit('joinChat', String(chatID));
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedChat?._id) {
      const message: Omit<Message, 'type'> = {
        msg: newMessage,
        msgFrom: user.username,
        msgDateTime: new Date(),
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
    const chat = await createChat(allParticipants, user.username);
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
        case 'changeUserRole': {
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
  };
};

export default useDirectMessage;
