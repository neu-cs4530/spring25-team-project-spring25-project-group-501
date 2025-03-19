import { ObjectId } from 'mongodb';
import { Message, PopulatedDatabaseChat, Role } from '../types/types';
import api from './config';

const CHAT_API_URL = `${process.env.REACT_APP_SERVER_URL}/chat`;

/**
 * Fetches all chats associated with a given user.
 *
 * @param username - The username of the user whose chats are to be fetched.
 * @returns The list of chats for the specified user.
 * @throws Throws an error if the fetch fails or if the status code is not 200.
 */
export const getChatsByUser = async (username: string): Promise<PopulatedDatabaseChat[]> => {
  const res = await api.get(`${CHAT_API_URL}/getChatsByUser/${username}`);

  if (res.status !== 200) {
    throw new Error('Error when fetching chats for user');
  }

  return res.data;
};

/**
 * Fetches a chat by its unique ID.
 *
 * @param chatID - The ID of the chat to fetch.
 * @returns The details of the chat with the specified ID.
 * @throws Throws an error if the fetch fails or if the status code is not 200.
 */
export const getChatById = async (chatID: ObjectId): Promise<PopulatedDatabaseChat> => {
  const res = await api.get(`${CHAT_API_URL}/${chatID}`);

  if (res.status !== 200) {
    throw new Error('Error when fetching chat by ID');
  }

  return res.data;
};

/**
 * Sends a message to a specific chat.
 *
 * @param message - The message to be sent, excluding the 'type' property.
 * @param chatID - The ID of the chat to which the message will be added.
 * @returns The updated chat data after the message has been sent.
 * @throws Throws an error if the message could not be added to the chat.
 */
export const sendMessage = async (
  message: Omit<Message, 'type'>,
  chatID: ObjectId,
): Promise<PopulatedDatabaseChat> => {
  const res = await api.post(`${CHAT_API_URL}/${chatID}/addMessage`, message);

  if (res.status !== 200) {
    throw new Error('Error when adding message to chat');
  }

  return res.data;
};

/**
 * Creates a new chat with the specified participants.
 *
 * @param participants - An array of user IDs representing the participants of the chat.
 * @returns The newly created chat data.
 * @throws Throws an error if the chat creation fails or if the status code is not 200.
 */
export const createChat = async (
  participants: string[],
  owner: string,
): Promise<PopulatedDatabaseChat> => {
  const permissions = participants.map(participant => ({
    user: participant,
    role: participant === owner ? 'admin' : 'user',
  }));
  const res = await api.post(`${CHAT_API_URL}/createChat`, {
    participants,
    messages: [],
    permissions,
  });

  if (res.status !== 200) {
    throw new Error('Error when adding message to chat');
  }

  return res.data;
};

export const addParticipantToChat = async (
  chatID: ObjectId,
  username: string,
): Promise<PopulatedDatabaseChat> => {
  const res = await api.post(`${CHAT_API_URL}/${chatID}/addParticipant`, { username });

  if (res.status !== 200) {
    throw new Error('Error when adding participant to chat');
  }

  return res.data;
};

export const deleteChatMessage = async (
  chatID: ObjectId,
  messageID: ObjectId,
): Promise<PopulatedDatabaseChat> => {
  const res = await api.delete(`${CHAT_API_URL}/${chatID}/message/${messageID}`);

  if (res.status !== 200) {
    throw new Error('Error when deleting message from chat');
  }

  return res.data;
};

export const updateUserPermission = async (
  chatID: ObjectId,
  username: string,
  role: Role,
): Promise<PopulatedDatabaseChat> => {
  const res = await api.patch(`${CHAT_API_URL}/${chatID}/changeUserRole`, {
    username,
    role,
  });

  if (res.status !== 200) {
    throw new Error('Error when updating user permission');
  }

  return res.data;
};
