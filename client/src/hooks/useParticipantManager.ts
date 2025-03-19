import { useState } from 'react';
import { ObjectId } from 'mongodb';
import { deleteChatMessage, updateUserPermission } from '../services/chatService';
import { Role } from '../types/types';

const useParticipantManager = (chatId: ObjectId, currentUserPermission: string) => {
  const [error, setError] = useState<string | null>(null);

  const handleChangeUserPermission = async (targetUsername: string, newPermission: Role) => {
    if (currentUserPermission !== 'admin') {
      setError('You do not have permission to change user permissions.');
      return;
    }
    try {
      await updateUserPermission(chatId, targetUsername, newPermission);
      setError(null);
    } catch (err) {
      setError('Failed to update permission.');
    }
  };

  return { error, handleChangeUserPermission, setError };
};

export default useParticipantManager;
