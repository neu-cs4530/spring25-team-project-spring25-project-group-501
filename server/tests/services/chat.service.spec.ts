import mongoose from 'mongoose';
import ChatModel from '../../models/chat.model';
import MessageModel from '../../models/messages.model';
import UserModel from '../../models/users.model';
import {
  saveChat,
  addMessageToChat,
  getChat,
  addParticipantToChat,
  getChatsByParticipants,
  changeUserRole,
  deleteChatMessage,
} from '../../services/chat.service';
import { Chat, DatabaseChat, Role } from '../../types/types';
import { user } from '../mockData.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Chat service', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  describe('saveChat', () => {
    const mockChatPayload: Chat = {
      title: 'Test Chat',
      permissions: [{ user: 'user1', role: 'user' as Role }],
      participants: ['user1'],
      messages: [
        {
          msg: 'Hello!',
          msgFrom: 'user1',
          msgDateTime: new Date('2025-01-01T00:00:00.000Z'),
          type: 'direct',
        },
      ],
    };

    it('should successfully save a chat and verify its body (ignore exact IDs)', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');

      // Mock message creation
      mockingoose(MessageModel).toReturn(
        {
          _id: new mongoose.Types.ObjectId(),
          msg: 'Hello!',
          msgFrom: 'user1',
          msgDateTime: new Date('2025-01-01T00:00:00Z'),
          type: 'direct',
        },
        'create',
      );

      // Mock chat creation
      mockingoose(ChatModel).toReturn(
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Test Chat',
          participants: ['user1'],
          messages: [new mongoose.Types.ObjectId()],
          permissions: [{ user: 'user1', role: 'user' }],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        'create',
      );

      // Call the service
      const result = await saveChat(mockChatPayload);

      // Verify no error
      if ('error' in result) {
        throw new Error(`Expected a Chat, got error: ${result.error}`);
      }

      expect(result).toHaveProperty('_id');
      expect(result).toHaveProperty('title', 'Test Chat');
      expect(Array.isArray(result.participants)).toBe(true);
      expect(Array.isArray(result.messages)).toBe(true);
      expect(Array.isArray(result.permissions)).toBe(true);
      expect(result.participants[0].toString()).toEqual(expect.any(String));
      expect(result.messages[0].toString()).toEqual(expect.any(String));
      expect(result.permissions[0]).toHaveProperty('user', 'user1');
      expect(result.permissions[0]).toHaveProperty('role', 'user');
    });

    it('should return an error if an exception occurs', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(MessageModel).toReturn(
        {
          _id: new mongoose.Types.ObjectId(),
          msg: 'Hello!',
          msgFrom: 'user1',
          msgDateTime: new Date('2025-01-01T00:00:00Z'),
          type: 'direct',
        },
        'create',
      );
      jest.spyOn(ChatModel, 'create').mockRejectedValueOnce(new Error('DB Error'));

      const result = await saveChat(mockChatPayload);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Error saving chat:');
      }
    });

    it('should return an error if saving a message fails', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      jest.spyOn(MessageModel, 'create').mockRejectedValueOnce(new Error('Message save error'));

      const result = await saveChat(mockChatPayload);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Error saving chat:');
      }
    });
  });

  describe('addMessageToChat', () => {
    it('should add a message ID to an existing chat', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const messageId = new mongoose.Types.ObjectId().toString();

      const mockUpdatedChat: DatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Chat',
        participants: ['testUser'],
        permissions: [{ user: 'testUser', role: 'user' }],
        messages: [new mongoose.Types.ObjectId()],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock findByIdAndUpdate
      mockingoose(ChatModel).toReturn(mockUpdatedChat, 'findOneAndUpdate');

      const result = await addMessageToChat(chatId, messageId);
      if ('error' in result) {
        throw new Error('Expected a chat, got an error');
      }

      expect(result.messages).toEqual(mockUpdatedChat.messages);
    });

    it('should return an error if chat is not found', async () => {
      mockingoose(ChatModel).toReturn(null, 'findOneAndUpdate');

      const result = await addMessageToChat('invalidChatId', 'someMsgId');
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Chat not found');
      }
    });

    it('should return an error if DB fails', async () => {
      jest.spyOn(ChatModel, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('DB Error'));

      const result = await addMessageToChat('anyChatId', 'anyMessageId');
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Error adding message to chat:');
      }
    });
  });

  describe('getChat', () => {
    it('should retrieve a chat by ID', async () => {
      const mockFoundChat: DatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Chat',
        participants: ['testUser'],
        permissions: [{ user: 'testUser', role: 'user' }],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockingoose(ChatModel).toReturn(mockFoundChat, 'findOne');
      const result = await getChat(mockFoundChat._id.toString());

      if ('error' in result) {
        throw new Error('Expected a chat, got an error');
      }
      expect(result._id).toEqual(mockFoundChat._id);
      expect(result.title).toEqual(mockFoundChat.title);
    });

    it('should return an error if the chat is not found', async () => {
      mockingoose(ChatModel).toReturn(null, 'findOne');

      const result = await getChat('anyChatId');
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Chat not found');
      }
    });

    it('should return an error if DB fails', async () => {
      jest.spyOn(ChatModel, 'findById').mockRejectedValueOnce(new Error('DB Error'));

      const result = await getChat('dbFailChatId');
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Error retrieving chat:');
      }
    });
  });

  describe('addParticipantToChat', () => {
    it('should add a participant and permission if user exists', async () => {
      // Mock user
      const newUserId = new mongoose.Types.ObjectId(); // Ensure consistent ID type
      mockingoose(UserModel).toReturn({ _id: newUserId, username: 'newUser' }, 'findOne');

      // Create an initial mock chat where 'existingUser' is the only participant.
      const chatId = new mongoose.Types.ObjectId();
      const mockChat = {
        _id: chatId,
        title: 'Test Chat',
        participants: ['existingUser'],
        permissions: [{ user: 'existingUser', role: 'admin' }],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Define what the updated chat should look like after adding the new user.
      const updatedMockChat = {
        ...mockChat,
        participants: [...mockChat.participants, 'newUser'],
        permissions: [...mockChat.permissions, { user: 'newUser', role: 'user' }],
      };

      // The first DB call (chat lookup) should return the original chat.
      mockingoose(ChatModel).toReturn(mockChat, 'findOne');
      // The update call should return the updated chat.
      mockingoose(ChatModel).toReturn(updatedMockChat, 'findOneAndUpdate');

      const result = await addParticipantToChat(chatId.toString(), 'newUser');
      if ('error' in result) {
        throw new Error('Expected a chat, got an error');
      }
      expect(result).not.toHaveProperty('error');
      expect(result.participants).toContain('newUser');
      expect(result.permissions).toEqual(
        expect.arrayContaining([expect.objectContaining({ user: 'newUser', role: 'user' })]),
      );
      expect(result.title).toBe('Test Chat');
    });

    it('should not add participant if user already exists in chat', async () => {
      // Mock user
      mockingoose(UserModel).toReturn(
        { _id: new mongoose.Types.ObjectId(), username: 'existingUser' },
        'findOne',
      );

      const mockChat: DatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Chat',
        participants: ['existingUser'],
        permissions: [{ user: 'existingUser', role: 'user' }],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockingoose(ChatModel).toReturn(mockChat, 'findOne');

      const result = await addParticipantToChat(mockChat._id.toString(), 'existingUser');
      if ('error' in result) {
        throw new Error('Expected a chat, got an error');
      }

      expect(result.participants).toEqual(['existingUser']);
      expect(result.permissions).toMatchObject([{ user: 'existingUser', role: 'user' }]);
    });

    it('should return an error if user does not exist', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      const result = await addParticipantToChat('anyChatId', 'nonExistentUser');
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('User does not exist.');
      }
    });

    it('should return an error if chat is not found', async () => {
      // user found
      mockingoose(UserModel).toReturn({ _id: 'validUserId', username: 'validUser' }, 'findOne');
      // but chat not found
      mockingoose(ChatModel).toReturn(null, 'findOne');

      const result = await addParticipantToChat('anyChatId', 'validUser');
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Chat not found');
      }
    });

    it('should return an error if DB fails during update', async () => {
      // User exists
      mockingoose(UserModel).toReturn({ _id: 'validUserId', username: 'validUser' }, 'findOne');

      // Chat exists but user isn't a participant
      const mockChat: DatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Chat',
        participants: ['existingUser'],
        permissions: [{ user: 'existingUser', role: 'user' }],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockingoose(ChatModel).toReturn(mockChat, 'findOne');

      // Mock DB failure during update
      mockingoose(ChatModel).toReturn(null, 'findOneAndUpdate');

      const result = await addParticipantToChat('chatId', 'validUser');
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Error adding participant to chat:');
      }
    });
  });

  describe('getChatsByParticipants', () => {
    it('should retrieve chats by participants', async () => {
      const mockChats: DatabaseChat[] = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Test Chat 1',
          participants: ['user1', 'user2'],
          permissions: [
            { user: 'user1', role: 'admin' },
            { user: 'user2', role: 'user' },
          ],
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Test Chat 2',
          participants: ['user1', 'user3'],
          permissions: [
            { user: 'user1', role: 'admin' },
            { user: 'user3', role: 'user' },
          ],
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockingoose(ChatModel).toReturn([mockChats[0]], 'find');

      const result = await getChatsByParticipants(['user1', 'user2']);
      expect(result).toHaveLength(1);
      expect(result[0]._id).toEqual(mockChats[0]._id);
    });

    it('should retrieve chats by participants where the provided list is a subset', async () => {
      const mockChats: DatabaseChat[] = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Test Chat 1',
          participants: ['user1', 'user2'],
          permissions: [
            { user: 'user1', role: 'admin' },
            { user: 'user2', role: 'user' },
          ],
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Test Chat 2',
          participants: ['user1', 'user3'],
          permissions: [
            { user: 'user1', role: 'admin' },
            { user: 'user3', role: 'user' },
          ],
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockingoose(ChatModel).toReturn([mockChats[0], mockChats[1]], 'find');

      const result = await getChatsByParticipants(['user1']);
      expect(result).toHaveLength(2);
      expect(result[0]._id).toEqual(mockChats[0]._id);
      expect(result[1]._id).toEqual(mockChats[1]._id);
    });

    it('should return an empty array if no chats are found', async () => {
      mockingoose(ChatModel).toReturn([], 'find');

      const result = await getChatsByParticipants(['user1']);
      expect(result).toHaveLength(0);
    });

    it('should return an empty array if chats is null', async () => {
      mockingoose(ChatModel).toReturn(null, 'find');

      const result = await getChatsByParticipants(['user1']);
      expect(result).toHaveLength(0);
    });

    it('should return an empty array if a database error occurs', async () => {
      mockingoose(ChatModel).toReturn(new Error('database error'), 'find');

      const result = await getChatsByParticipants(['user1']);
      expect(result).toHaveLength(0);
    });
  });

  describe('changeUserRole', () => {
    it('should change a user role successfully', async () => {
      const mockChat: DatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Chat',
        participants: ['user1', 'user2'],
        permissions: [
          { user: 'user1', role: 'admin' },
          { user: 'user2', role: 'user' },
        ],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedMockChat = {
        ...mockChat,
        permissions: [
          { user: 'user1', role: 'admin' },
          { user: 'user2', role: 'moderator' },
        ],
      };

      mockingoose(ChatModel).toReturn(updatedMockChat, 'findOneAndUpdate');

      const result = await changeUserRole(mockChat._id.toString(), 'user2', 'moderator');

      if ('error' in result) {
        throw new Error('Expected a chat, got an error');
      }

      expect(result.permissions).toMatchObject([
        { user: 'user1', role: 'admin' },
        { user: 'user2', role: 'moderator' },
      ]);
      expect(result.title).toBe('Test Chat');
    });

    it('should return an error if chat not found or user not a participant', async () => {
      mockingoose(ChatModel).toReturn(null, 'findOneAndUpdate');

      const result = await changeUserRole('chatId', 'nonParticipantUser', 'moderator');

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Chat not found or user not a participant');
      }
    });

    it('should return an error if DB fails', async () => {
      jest.spyOn(ChatModel, 'findOneAndUpdate').mockRejectedValueOnce(new Error('DB Error'));

      const result = await changeUserRole('chatId', 'user1', 'moderator');

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Error changing user role:');
      }
    });
  });

  describe('deleteChatMessage', () => {
    it('should delete a message from chat successfully', async () => {
      const chatId = new mongoose.Types.ObjectId();
      const messageId = new mongoose.Types.ObjectId();
      const messageId2 = new mongoose.Types.ObjectId();

      const mockChat: DatabaseChat = {
        _id: chatId,
        title: 'Test Chat',
        participants: ['user1'],
        permissions: [{ user: 'user1', role: 'admin' }],
        messages: [messageId, messageId2],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedMockChat = {
        ...mockChat,
        messages: [messageId2],
      };

      mockingoose(ChatModel).toReturn(updatedMockChat, 'findOneAndUpdate');

      const result = await deleteChatMessage(chatId.toString(), messageId.toString());

      if ('error' in result) {
        throw new Error('Expected a chat, got an error');
      }

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toEqual(messageId2);
    });

    it('should return an error if chat not found', async () => {
      mockingoose(ChatModel).toReturn(null, 'findOneAndUpdate');

      const result = await deleteChatMessage('chatId', 'messageId');

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Chat not found');
      }
    });

    it('should return an error if DB fails', async () => {
      jest.spyOn(ChatModel, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('DB Error'));

      const result = await deleteChatMessage('chatId', 'messageId');

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Error deleting message from chat:');
      }
    });
  });
});
