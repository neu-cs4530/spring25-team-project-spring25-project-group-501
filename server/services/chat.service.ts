import { ObjectId } from 'mongodb';
import ChatModel from '../models/chat.model';
import UserModel from '../models/users.model';
import {
  Chat,
  ChatResponse,
  DatabaseChat,
  MessageResponse,
  DatabaseUser,
  Role,
} from '../types/types';
import { saveMessage } from './message.service';

/**
 * Saves a new chat, storing any messages provided as part of the argument.
 * @param chatPayload - The chat object containing full message data.
 * @returns {Promise<ChatResponse>} - The saved chat or an error message.
 */
export const saveChat = async (chatPayload: Chat): Promise<ChatResponse> => {
  try {
    // Save the messages provided in the arugment to the database
    const messageIds: ObjectId[] = await Promise.all(
      chatPayload.messages.map(async msg => {
        const savedMessage: MessageResponse = await saveMessage(msg);

        if ('error' in savedMessage) {
          throw new Error(savedMessage.error);
        }

        return savedMessage._id;
      }),
    );

    // Create the chat using participant IDs and saved message IDs
    return await ChatModel.create({
      title: chatPayload.title,
      participants: chatPayload.participants,
      messages: messageIds,
      permissions: chatPayload.permissions,
    });
  } catch (error) {
    return { error: `Error saving chat: ${error}` };
  }
};

/**
 * Adds a message ID to a chat.
 * @param chatId - The ID of the chat to update.
 * @param messageId - The ID of the message to add.
 * @returns {Promise<ChatResponse>} - The updated chat or an error message.
 */
export const addMessageToChat = async (
  chatId: string,
  messageId: string,
): Promise<ChatResponse> => {
  try {
    const updatedChat: DatabaseChat | null = await ChatModel.findByIdAndUpdate(
      chatId,
      { $push: { messages: messageId } },
      { new: true },
    );

    if (!updatedChat) {
      throw new Error('Chat not found');
    }

    return updatedChat;
  } catch (error) {
    return { error: `Error adding message to chat: ${error}` };
  }
};

/**
 * Retrieves a chat document by its ID.
 * @param chatId - The ID of the chat to retrieve.
 * @returns {Promise<ChatResponse>} - The chat or an error message.
 */
export const getChat = async (chatId: string): Promise<ChatResponse> => {
  try {
    const chat: DatabaseChat | null = await ChatModel.findById(chatId);

    if (!chat) {
      throw new Error('Chat not found');
    }

    return chat;
  } catch (error) {
    return { error: `Error retrieving chat: ${error}` };
  }
};

/**
 * Retrieves chats that include all the provided participants.
 * @param p - An array of participant usernames or IDs.
 * @returns {Promise<DatabaseChat[]>} - An array of matching chats or an empty array.
 */
export const getChatsByParticipants = async (p: string[]): Promise<DatabaseChat[]> => {
  try {
    const chats = await ChatModel.find({ participants: { $all: p } }).lean();

    if (!chats) {
      throw new Error('Chat not found with the provided participants');
    }

    return chats;
  } catch {
    return [];
  }
};

/**
 * Adds a participant to an existing chat if they are not already included.
 * @param chatId - The ID of the chat to update.
 * @param username - The username of the user to add to the chat.
 * @returns {Promise<ChatResponse>} - The updated chat or an error message.
 */
export const addParticipantToChat = async (
  chatId: string,
  username: string,
): Promise<ChatResponse> => {
  try {
    // Validate if user exists
    const userExists: DatabaseUser | null = await UserModel.findOne({ username });

    if (!userExists) {
      throw new Error('User does not exist.');
    }

    // Check if user is already in the chat
    const existingChat: DatabaseChat | null = await ChatModel.findOne({ _id: chatId });

    if (!existingChat) {
      throw new Error('Chat not found.');
    }

    if (existingChat.participants.includes(username)) {
      // User is already a participant, return the chat as is
      return existingChat;
    }

    // Add participant since they're not already in the chat
    const updatedChat: DatabaseChat | null = await ChatModel.findOneAndUpdate(
      { _id: chatId },
      {
        $push: { participants: username, permissions: { user: username, role: 'user' } },
      },
      { new: true }, // Return the updated document
    );

    if (!updatedChat) {
      throw new Error('Failed to update chat.');
    }

    return updatedChat;
  } catch (error) {
    return { error: `Error adding participant to chat: ${(error as Error).message}` };
  }
};

export const changeUserRole = async (
  chatId: string,
  userId: string,
  role: Role,
): Promise<ChatResponse> => {
  try {
    const updatedChat: DatabaseChat | null = await ChatModel.findOneAndUpdate(
      { '_id': chatId, 'permissions.user': userId },
      { $set: { 'permissions.$.role': role } },
      { new: true },
    );

    if (!updatedChat) {
      throw new Error('Chat not found or user not a participant.');
    }

    return updatedChat;
  } catch (error) {
    return { error: `Error changing user role: ${(error as Error).message}` };
  }
};

export const deleteChatMessage = async (
  chatId: string,
  messageId: string,
): Promise<ChatResponse> => {
  try {
    const updatedChat: DatabaseChat | null = await ChatModel.findByIdAndUpdate(
      chatId,
      { $pull: { messages: messageId } },
      { new: true },
    );

    if (!updatedChat) {
      throw new Error('Chat not found');
    }

    return updatedChat;
  } catch (error) {
    return { error: `Error deleting message from chat: ${(error as Error).message}` };
  }
};
