import mongoose from 'mongoose';
import supertest from 'supertest';
import { Server, type Socket as ServerSocket } from 'socket.io';
import { createServer } from 'http';
import { io as Client, type Socket as ClientSocket } from 'socket.io-client';
import { AddressInfo } from 'net';
import { app } from '../../app';
import * as messageService from '../../services/message.service';
import * as chatService from '../../services/chat.service';
import * as databaseUtil from '../../utils/database.util';
import { DatabaseChat, PopulatedDatabaseChat, Message, Role } from '../../types/types';
import chatController from '../../controllers/chat.controller';

/**
 * Sample test suite for the /chat endpoints
 */

/**
 * Spies on the service functions
 */
const saveChatSpy = jest.spyOn(chatService, 'saveChat');
const saveMessageSpy = jest.spyOn(messageService, 'saveMessage');
const addMessageSpy = jest.spyOn(chatService, 'addMessageToChat');
const getChatSpy = jest.spyOn(chatService, 'getChat');
const addParticipantSpy = jest.spyOn(chatService, 'addParticipantToChat');
const populateDocumentSpy = jest.spyOn(databaseUtil, 'populateDocument');
const getChatsByParticipantsSpy = jest.spyOn(chatService, 'getChatsByParticipants');
const changeUserRoleSpy = jest.spyOn(chatService, 'changeUserRole');
const deleteChatMessageSpy = jest.spyOn(chatService, 'deleteChatMessage');

describe('Chat Controller', () => {
  describe('POST /chat/createChat', () => {
    it('should create a new chat successfully', async () => {
      const validChatPayload = {
        title: 'Test Chat',
        participants: ['user1', 'user2'],
        permissions: [
          { user: 'user1', role: 'admin' as Role },
          { user: 'user2', role: 'user' as Role },
        ],
        messages: [{ msg: 'Hello!', msgFrom: 'user1', msgDateTime: new Date('2025-01-01') }],
      };

      const serializedPayload = {
        ...validChatPayload,
        messages: validChatPayload.messages.map(message => ({
          ...message,
          type: 'direct',
          msgDateTime: message.msgDateTime.toISOString(),
        })),
      };

      const chatResponse: DatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Chat',
        participants: ['user1', 'user2'],
        permissions: [
          { user: 'user1', role: 'admin' },
          { user: 'user2', role: 'user' },
        ],
        messages: [new mongoose.Types.ObjectId()],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const populatedChatResponse: PopulatedDatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Chat',
        participants: ['user1', 'user2'],
        permissions: [
          { user: 'user1', role: 'admin' },
          { user: 'user2', role: 'user' },
        ],
        messages: [
          {
            _id: chatResponse.messages[0],
            msg: 'Hello!',
            msgFrom: 'user1',
            msgDateTime: new Date('2025-01-01'),
            user: {
              _id: new mongoose.Types.ObjectId(),
              username: 'user1',
            },
            type: 'direct',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      saveChatSpy.mockResolvedValue(chatResponse);
      populateDocumentSpy.mockResolvedValue(populatedChatResponse);

      const response = await supertest(app).post('/chat/createChat').send(validChatPayload);

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        _id: populatedChatResponse._id.toString(),
        title: 'Test Chat',
        participants: populatedChatResponse.participants.map(participant => participant.toString()),
        permissions: populatedChatResponse.permissions,
        messages: populatedChatResponse.messages.map(message => ({
          ...message,
          _id: message._id.toString(),
          msgDateTime: message.msgDateTime.toISOString(),
          user: {
            ...message.user,
            _id: message.user?._id.toString(),
          },
        })),
        createdAt: populatedChatResponse.createdAt.toISOString(),
        updatedAt: populatedChatResponse.updatedAt.toISOString(),
      });

      // Update expected value to match serialization
      expect(saveChatSpy).toHaveBeenCalledWith(serializedPayload);
      expect(populateDocumentSpy).toHaveBeenCalledWith(chatResponse._id.toString(), 'chat');
    });

    it('should return 400 if participants array is invalid', async () => {
      const invalidPayload = {
        title: 'Test Chat',
        participants: [],
        permissions: [],
        messages: [],
      };

      const response = await supertest(app).post('/chat/createChat').send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid chat creation request');
    });

    it('should return 400 if permissions array is invalid', async () => {
      const invalidPayload = {
        title: 'Test Chat',
        participants: ['user1'],
        permissions: [], // Empty permissions array
        messages: [],
      };

      const response = await supertest(app).post('/chat/createChat').send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid chat creation request');
    });

    it('should return 500 on service error', async () => {
      const validPayload = {
        title: 'Test Chat',
        participants: ['user1'],
        permissions: [{ user: 'user1', role: 'user' as Role }],
        messages: [],
      };

      saveChatSpy.mockResolvedValue({ error: 'Service error' });

      const response = await supertest(app).post('/chat/createChat').send(validPayload);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error creating a chat: Service error');
    });

    it('should return 500 if populateDocument fails', async () => {
      const validPayload = {
        title: 'Test Chat',
        participants: ['user1'],
        permissions: [{ user: 'user1', role: 'user' as Role }],
        messages: [],
      };

      const chatResponse: DatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Chat',
        participants: ['user1'],
        permissions: [{ user: 'user1', role: 'user' }],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      saveChatSpy.mockResolvedValue(chatResponse);
      populateDocumentSpy.mockResolvedValue({ error: 'Error populating chat' });

      const response = await supertest(app).post('/chat/createChat').send(validPayload);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error creating a chat: Error populating chat');
    });
  });

  describe('POST /chat/:chatId/addMessage', () => {
    it('should add a message to chat successfully', async () => {
      const chatId = new mongoose.Types.ObjectId();
      const messagePayload: Message = {
        msg: 'Hello!',
        msgFrom: 'user1',
        msgDateTime: new Date('2025-01-01'),
        type: 'direct',
      };

      const serializedPayload = {
        ...messagePayload,
        msgDateTime: messagePayload.msgDateTime.toISOString(),
      };

      const messageResponse = {
        _id: new mongoose.Types.ObjectId(),
        ...messagePayload,
        user: {
          _id: new mongoose.Types.ObjectId(),
          username: 'user1',
        },
      };

      const chatResponse: DatabaseChat = {
        _id: chatId,
        title: 'Test Chat',
        participants: ['user1', 'user2'],
        permissions: [
          { user: 'user1', role: 'admin' },
          { user: 'user2', role: 'user' },
        ],
        messages: [messageResponse._id],
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      const populatedChatResponse: PopulatedDatabaseChat = {
        _id: chatId,
        title: 'Test Chat',
        participants: ['user1', 'user2'],
        permissions: [
          { user: 'user1', role: 'admin' },
          { user: 'user2', role: 'user' },
        ],
        messages: [messageResponse],
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      saveMessageSpy.mockResolvedValue(messageResponse);
      addMessageSpy.mockResolvedValue(chatResponse);
      populateDocumentSpy.mockResolvedValue(populatedChatResponse);

      const response = await supertest(app).post(`/chat/${chatId}/addMessage`).send(messagePayload);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        _id: populatedChatResponse._id.toString(),
        title: 'Test Chat',
        participants: populatedChatResponse.participants.map(participant => participant.toString()),
        permissions: populatedChatResponse.permissions,
        messages: populatedChatResponse.messages.map(message => ({
          ...message,
          _id: message._id.toString(),
          msgDateTime: message.msgDateTime.toISOString(),
          user: {
            ...message.user,
            _id: message.user?._id.toString(),
          },
        })),
        createdAt: populatedChatResponse.createdAt.toISOString(),
        updatedAt: populatedChatResponse.updatedAt.toISOString(),
      });

      expect(saveMessageSpy).toHaveBeenCalledWith(serializedPayload);
      expect(addMessageSpy).toHaveBeenCalledWith(chatId.toString(), messageResponse._id.toString());
      expect(populateDocumentSpy).toHaveBeenCalledWith(
        populatedChatResponse._id.toString(),
        'chat',
      );
    });

    it('should add a poll message to chat successfully', async () => {
      const chatId = new mongoose.Types.ObjectId();
      const pollMessagePayload = {
        msg: 'Poll Question',
        msgFrom: 'user1',
        msgDateTime: new Date('2025-01-01'),
        type: 'poll' as 'direct' | 'global' | 'poll',
        poll: {
          question: 'Favorite color?',
          options: [{ optionText: 'Red' }, { optionText: 'Blue' }, { optionText: 'Green' }],
          votes: Object.fromEntries(new Map()), // Convert Map to Object
        },
      };

      const serializedPayload = {
        ...pollMessagePayload,
        msgDateTime: pollMessagePayload.msgDateTime.toISOString(),
      };

      const messageResponse = {
        _id: new mongoose.Types.ObjectId(),
        ...pollMessagePayload,
        user: {
          _id: new mongoose.Types.ObjectId(),
          username: 'user1',
        },
      };

      const chatResponse: DatabaseChat = {
        _id: chatId,
        title: 'Test Chat',
        participants: ['user1', 'user2'],
        permissions: [
          { user: 'user1', role: 'admin' },
          { user: 'user2', role: 'user' },
        ],
        messages: [messageResponse._id],
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      const populatedChatResponse: PopulatedDatabaseChat = {
        _id: chatId,
        title: 'Test Chat',
        participants: ['user1', 'user2'],
        permissions: [
          { user: 'user1', role: 'admin' },
          { user: 'user2', role: 'user' },
        ],
        messages: [messageResponse],
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      saveMessageSpy.mockResolvedValue(messageResponse);
      addMessageSpy.mockResolvedValue(chatResponse);
      populateDocumentSpy.mockResolvedValue(populatedChatResponse);

      const response = await supertest(app)
        .post(`/chat/${chatId}/addMessage`)
        .send(pollMessagePayload);

      expect(response.status).toBe(200);
      expect(saveMessageSpy).toHaveBeenCalledWith(serializedPayload);
      expect(response.body.messages[0].poll).toMatchObject(pollMessagePayload.poll);
    });

    it('should return 400 for missing chatId, msg, or msgFrom', async () => {
      const chatId = new mongoose.Types.ObjectId();

      // Test missing msg
      const missingMsg = {
        msgFrom: 'user1',
        msgDateTime: new Date('2025-01-01'),
        type: 'direct' as 'direct' | 'global',
      };
      const response1 = await supertest(app).post(`/chat/${chatId}/addMessage`).send(missingMsg);
      expect(response1.status).toBe(400);

      // Test missing msgFrom
      const missingFrom = {
        msg: 'Hello!',
        msgDateTime: new Date('2025-01-01'),
        type: 'direct' as 'direct' | 'global',
      };
      const response2 = await supertest(app).post(`/chat/${chatId}/addMessage`).send(missingFrom);
      expect(response2.status).toBe(400);

      // Test missing type
      const missingType = {
        msg: 'Hello!',
        msgFrom: 'user1',
        msgDateTime: new Date('2025-01-01'),
      };
      const response3 = await supertest(app).post(`/chat/${chatId}/addMessage`).send(missingType);
      expect(response3.status).toBe(400);
    });

    it('should return 500 if addMessageToChat returns an error', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();

      // 1) Mock `createMessage` to succeed
      saveMessageSpy.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        msg: 'Hello',
        msgFrom: 'UserX',
        msgDateTime: new Date(),
        type: 'direct',
      });

      // 2) Mock `addMessageToChat` to return an error object
      addMessageSpy.mockResolvedValue({ error: 'Error updating chat' });

      // 3) Invoke the endpoint with valid body
      const response = await supertest(app).post(`/chat/${chatId}/addMessage`).send({
        msg: 'Hello',
        msgFrom: 'UserX',
        msgDateTime: new Date().toISOString(),
        type: 'direct',
      });

      // 4) Expect a 500 with the error message
      expect(response.status).toBe(500);
      expect(response.text).toContain('Error updating chat');
    });

    it('should throw an error if message creation fails and does not return an _id', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const messagePayload: Message = {
        msg: 'Hello',
        msgFrom: 'User1',
        msgDateTime: new Date(),
        type: 'direct',
      };

      // Mock createMessageSpy to return an object with _id as undefined
      saveMessageSpy.mockResolvedValue({ error: 'Error saving message' });

      const response = await supertest(app).post(`/chat/${chatId}/addMessage`).send(messagePayload);

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error adding a message to chat: Error saving message');
    });

    it('should throw an error if updatedChat returns an error', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const messagePayload = {
        msg: 'Hello',
        msgFrom: 'User1',
        msgDateTime: new Date(),
        type: 'direct' as 'direct' | 'global',
      };
      const mockMessage = {
        _id: new mongoose.Types.ObjectId(),
        ...messagePayload,
      };

      // Mock the successful creation of the message
      saveMessageSpy.mockResolvedValueOnce(mockMessage);

      // Mock the failure of updating the chat (addMessageToChat scenario)
      addMessageSpy.mockResolvedValueOnce({ error: 'Error updating chat' });

      // Call the endpoint
      const response = await supertest(app).post(`/chat/${chatId}/addMessage`).send(messagePayload);

      // Validate the response
      expect(response.status).toBe(500);
      expect(response.text).toContain('Error adding a message to chat: Error updating chat');
    });

    it('should return 500 if populateDocument returns an error', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const messagePayload = {
        msg: 'Hello',
        msgFrom: 'User1',
        msgDateTime: new Date(),
        type: 'direct' as 'direct' | 'global',
      };
      const mockMessage = {
        _id: new mongoose.Types.ObjectId(),
        ...messagePayload,
      };

      const updatedChat: DatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Chat',
        participants: ['user1'],
        permissions: [{ user: 'user1', role: 'admin' }],
        messages: [mockMessage._id],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the successful creation of the message
      saveMessageSpy.mockResolvedValueOnce(mockMessage);

      // Mock successful chat update
      addMessageSpy.mockResolvedValueOnce(updatedChat);

      // Mock failed population
      populateDocumentSpy.mockResolvedValueOnce({ error: 'Error populating chat' });

      // Call the endpoint
      const response = await supertest(app).post(`/chat/${chatId}/addMessage`).send(messagePayload);

      // Validate the response
      expect(response.status).toBe(500);
      expect(response.text).toContain('Error adding a message to chat: Error populating chat');
    });

    it('should return 500 if createMessage returns an error', async () => {
      saveMessageSpy.mockResolvedValue({ error: 'Service error' });

      const chatId = new mongoose.Types.ObjectId().toString();
      const messagePayload = {
        msg: 'Hello!',
        msgFrom: 'user1',
        msgDateTime: new Date(),
        type: 'direct' as 'direct' | 'global',
      };

      const response = await supertest(app).post(`/chat/${chatId}/addMessage`).send(messagePayload);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error adding a message to chat: Service error');
    });
  });

  describe('GET /chat/:chatId', () => {
    it('should retrieve a chat by ID', async () => {
      // 1) Prepare a valid chatId param
      const chatId = new mongoose.Types.ObjectId().toString();

      // 2) Mock a fully enriched chat
      const mockFoundChat: DatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Chat',
        participants: ['user1'],
        permissions: [{ user: 'user1', role: 'admin' }],
        messages: [new mongoose.Types.ObjectId()],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPopulatedChat: PopulatedDatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Chat',
        participants: ['user1'],
        permissions: [{ user: 'user1', role: 'admin' }],
        messages: [
          {
            _id: new mongoose.Types.ObjectId(),
            msg: 'Hello!',
            msgFrom: 'user1',
            msgDateTime: new Date('2025-01-01T00:00:00Z'),
            user: {
              _id: new mongoose.Types.ObjectId(),
              username: 'user1',
            },
            type: 'direct',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 3) Mock the service calls
      getChatSpy.mockResolvedValue(mockFoundChat);
      populateDocumentSpy.mockResolvedValue(mockPopulatedChat);

      // 4) Invoke the endpoint
      const response = await supertest(app).get(`/chat/${chatId}`);

      // 5) Assertions
      expect(response.status).toBe(200);
      expect(getChatSpy).toHaveBeenCalledWith(chatId);
      expect(populateDocumentSpy).toHaveBeenCalledWith(mockFoundChat._id.toString(), 'chat');

      // Convert ObjectIds and Dates for comparison
      expect(response.body).toMatchObject({
        _id: mockPopulatedChat._id.toString(),
        title: 'Test Chat',
        participants: mockPopulatedChat.participants.map(p => p.toString()),
        permissions: mockPopulatedChat.permissions,
        messages: mockPopulatedChat.messages.map(m => ({
          _id: m._id.toString(),
          msg: m.msg,
          msgFrom: m.msgFrom,
          msgDateTime: m.msgDateTime.toISOString(),
          user: {
            _id: m.user?._id.toString(),
            username: m.user?.username,
          },
        })),
        createdAt: mockPopulatedChat.createdAt.toISOString(),
        updatedAt: mockPopulatedChat.updatedAt.toISOString(),
      });
    });

    it('should return 500 if getChat fails', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      getChatSpy.mockResolvedValue({ error: 'Service error' });

      const response = await supertest(app).get(`/chat/${chatId}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error retrieving chat: Service error');
    });

    it('should return 500 if populateDocument returns an error', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const foundChat = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Chat',
        participants: ['testUser'],
        permissions: [{ user: 'testUser', role: 'user' as Role }],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the getChat service to return a valid chat
      getChatSpy.mockResolvedValue(foundChat);

      // Mock populateDocument to return an error
      populateDocumentSpy.mockResolvedValue({ error: 'Error populating chat' });

      const response = await supertest(app).get(`/chat/${chatId}`);

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error populating chat');
      expect(getChatSpy).toHaveBeenCalledWith(chatId);
      expect(populateDocumentSpy).toHaveBeenCalledWith(foundChat._id.toString(), 'chat');
    });
  });

  describe('POST /chat/:chatId/addParticipant', () => {
    it('should add a participant to an existing chat', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const userId = 'newUser';

      const updatedChat: DatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Chat',
        participants: ['user1', 'newUser'],
        permissions: [
          { user: 'user1', role: 'admin' },
          { user: 'newUser', role: 'user' },
        ],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const populatedUpdatedChat: PopulatedDatabaseChat = {
        _id: updatedChat._id,
        title: 'Test Chat',
        participants: ['user1', 'newUser'],
        permissions: [
          { user: 'user1', role: 'admin' },
          { user: 'newUser', role: 'user' },
        ],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addParticipantSpy.mockResolvedValue(updatedChat);
      populateDocumentSpy.mockResolvedValue(populatedUpdatedChat);

      const response = await supertest(app)
        .post(`/chat/${chatId}/addParticipant`)
        .send({ username: userId });

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        _id: populatedUpdatedChat._id.toString(),
        title: 'Test Chat',
        participants: populatedUpdatedChat.participants.map(id => id.toString()),
        permissions: populatedUpdatedChat.permissions,
        messages: [],
        createdAt: populatedUpdatedChat.createdAt.toISOString(),
        updatedAt: populatedUpdatedChat.updatedAt.toISOString(),
      });

      expect(addParticipantSpy).toHaveBeenCalledWith(chatId, userId);
    });

    it('should return 400 if userId is missing', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const response = await supertest(app).post(`/chat/${chatId}/addParticipant`).send({}); // Missing userId

      expect(response.status).toBe(400);
      expect(response.text).toBe('Missing chatId or userId');
    });

    it('should return 500 if addParticipantToChat fails', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const userId = 'newUser';

      addParticipantSpy.mockResolvedValue({ error: 'Service error' });

      const response = await supertest(app)
        .post(`/chat/${chatId}/addParticipant`)
        .send({ username: userId });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error adding participant to chat: Service error');
    });

    it('should return 500 if populateDocument fails', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const userId = 'newUser';

      const updatedChat: DatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Chat',
        participants: ['user1', 'newUser'],
        permissions: [
          { user: 'user1', role: 'admin' },
          { user: 'newUser', role: 'user' },
        ],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addParticipantSpy.mockResolvedValue(updatedChat);
      populateDocumentSpy.mockResolvedValue({ error: 'Error populating chat' });

      const response = await supertest(app)
        .post(`/chat/${chatId}/addParticipant`)
        .send({ username: userId });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error adding participant to chat: Error populating chat');
    });
  });

  describe('GET /chat/getChatsByUser/:username', () => {
    it('should return 200 with an array of chats', async () => {
      const username = 'user1';

      const chats: DatabaseChat[] = [
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
      ];

      const populatedChats: PopulatedDatabaseChat[] = [
        {
          _id: chats[0]._id,
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
      ];

      getChatsByParticipantsSpy.mockResolvedValueOnce(chats);
      populateDocumentSpy.mockResolvedValueOnce(populatedChats[0]);

      const response = await supertest(app).get(`/chat/getChatsByUser/${username}`);

      expect(getChatsByParticipantsSpy).toHaveBeenCalledWith([username]);
      expect(populateDocumentSpy).toHaveBeenCalledWith(populatedChats[0]._id.toString(), 'chat');
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject([
        {
          _id: populatedChats[0]._id.toString(),
          title: 'Test Chat 1',
          participants: ['user1', 'user2'],
          permissions: [
            { user: 'user1', role: 'admin' },
            { user: 'user2', role: 'user' },
          ],
          messages: [],
          createdAt: populatedChats[0].createdAt.toISOString(),
          updatedAt: populatedChats[0].updatedAt.toISOString(),
        },
      ]);
    });

    it('should return 500 if populateDocument fails for any chat', async () => {
      const username = 'user1';
      const chats: DatabaseChat[] = [
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
      ];

      getChatsByParticipantsSpy.mockResolvedValueOnce(chats);
      populateDocumentSpy.mockResolvedValueOnce({ error: 'Service error' });

      const response = await supertest(app).get(`/chat/getChatsByUser/${username}`);

      expect(getChatsByParticipantsSpy).toHaveBeenCalledWith([username]);
      expect(populateDocumentSpy).toHaveBeenCalledWith(chats[0]._id.toString(), 'chat');
      expect(response.status).toBe(500);
      expect(response.text).toBe('Error retrieving chat: Failed populating all retrieved chats');
    });
  });

  describe('PATCH /chat/:chatId/changeUserRole', () => {
    it('should successfully change a user role', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const username = 'user2';
      const newRole = 'moderator' as Role;

      const updatedChat: DatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Chat',
        participants: ['user1', 'user2'],
        permissions: [
          { user: 'user1', role: 'admin' },
          { user: 'user2', role: 'moderator' },
        ],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const populatedChat: PopulatedDatabaseChat = {
        _id: updatedChat._id,
        title: 'Test Chat',
        participants: ['user1', 'user2'],
        permissions: [
          { user: 'user1', role: 'admin' },
          { user: 'user2', role: 'moderator' },
        ],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      changeUserRoleSpy.mockResolvedValue(updatedChat);
      populateDocumentSpy.mockResolvedValue(populatedChat);

      const response = await supertest(app)
        .patch(`/chat/${chatId}/changeUserRole`)
        .send({ username, role: newRole });

      expect(response.status).toBe(200);
      expect(changeUserRoleSpy).toHaveBeenCalledWith(chatId, username, newRole);
      expect(populateDocumentSpy).toHaveBeenCalledWith(updatedChat._id.toString(), 'chat');
      expect(response.body).toMatchObject({
        _id: updatedChat._id.toString(),
        title: 'Test Chat',
        participants: updatedChat.participants,
        permissions: updatedChat.permissions,
        messages: [],
        createdAt: updatedChat.createdAt.toISOString(),
        updatedAt: updatedChat.updatedAt.toISOString(),
      });
    });

    it('should return 400 if required fields are missing', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();

      // Missing username
      const response1 = await supertest(app)
        .patch(`/chat/${chatId}/changeUserRole`)
        .send({ role: 'moderator' });

      expect(response1.status).toBe(400);
      expect(response1.text).toBe('Missing required fields: chatId, username or role');

      // Missing role
      const response2 = await supertest(app)
        .patch(`/chat/${chatId}/changeUserRole`)
        .send({ username: 'user2' });

      expect(response2.status).toBe(400);
      expect(response2.text).toBe('Missing required fields: chatId, username or role');
    });

    it('should return 500 if changeUserRole service fails', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const username = 'user2';
      const newRole = 'moderator' as Role;

      changeUserRoleSpy.mockResolvedValue({ error: 'Error changing role' });

      const response = await supertest(app)
        .patch(`/chat/${chatId}/changeUserRole`)
        .send({ username, role: newRole });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error changing user role: Error changing role');
    });

    it('should return 500 if populateDocument fails', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const username = 'user2';
      const newRole = 'moderator' as Role;

      const updatedChat: DatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Chat',
        participants: ['user1', 'user2'],
        permissions: [
          { user: 'user1', role: 'admin' },
          { user: 'user2', role: 'moderator' },
        ],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      changeUserRoleSpy.mockResolvedValue(updatedChat);
      populateDocumentSpy.mockResolvedValue({ error: 'Error populating chat' });

      const response = await supertest(app)
        .patch(`/chat/${chatId}/changeUserRole`)
        .send({ username, role: newRole });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error changing user role: Error populating chat');
    });
  });

  describe('DELETE /chat/:chatId/message/:messageId', () => {
    it('should successfully delete a message from chat', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const messageId = new mongoose.Types.ObjectId().toString();

      const updatedChat: DatabaseChat = {
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

      const populatedChat: PopulatedDatabaseChat = {
        _id: updatedChat._id,
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

      deleteChatMessageSpy.mockResolvedValue(updatedChat);
      populateDocumentSpy.mockResolvedValue(populatedChat);

      const response = await supertest(app).delete(`/chat/${chatId}/message/${messageId}`);

      expect(response.status).toBe(200);
      expect(deleteChatMessageSpy).toHaveBeenCalledWith(chatId, messageId);
      expect(populateDocumentSpy).toHaveBeenCalledWith(updatedChat._id.toString(), 'chat');
      expect(response.body).toMatchObject({
        _id: updatedChat._id.toString(),
        title: 'Test Chat',
        participants: updatedChat.participants,
        permissions: updatedChat.permissions,
        messages: [],
        createdAt: updatedChat.createdAt.toISOString(),
        updatedAt: updatedChat.updatedAt.toISOString(),
      });
    });

    it('should return 500 if deleteChatMessage service fails', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const messageId = new mongoose.Types.ObjectId().toString();

      deleteChatMessageSpy.mockResolvedValue({ error: 'Error deleting message' });

      const response = await supertest(app).delete(`/chat/${chatId}/message/${messageId}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error deleting message from chat: Error deleting message');
    });

    it('should return 500 if populateDocument fails', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const messageId = new mongoose.Types.ObjectId().toString();

      const updatedChat: DatabaseChat = {
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

      deleteChatMessageSpy.mockResolvedValue(updatedChat);
      populateDocumentSpy.mockResolvedValue({ error: 'Error populating chat' });

      const response = await supertest(app).delete(`/chat/${chatId}/message/${messageId}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error deleting message from chat: Error populating chat');
    });
  });

  describe('Socket handlers', () => {
    let io: Server;
    let serverSocket: ServerSocket;
    let clientSocket: ClientSocket;

    beforeAll(done => {
      const httpServer = createServer();
      io = new Server(httpServer);
      chatController(io);

      httpServer.listen(() => {
        const { port } = httpServer.address() as AddressInfo;
        clientSocket = Client(`http://localhost:${port}`);
        io.on('connection', socket => {
          serverSocket = socket;
        });
        clientSocket.on('connect', done);
      });
    });

    afterAll(() => {
      clientSocket.disconnect();
      serverSocket.disconnect();
      io.close();
    });

    it('should join a chat room when "joinChat" event is emitted', done => {
      serverSocket.on('joinChat', arg => {
        expect(io.sockets.adapter.rooms.has('chat123')).toBeTruthy();
        expect(arg).toBe('chat123');
        done();
      });
      clientSocket.emit('joinChat', 'chat123');
    });

    it('should leave a chat room when "leaveChat" event is emitted', done => {
      serverSocket.on('joinChat', arg => {
        expect(io.sockets.adapter.rooms.has('chat123')).toBeTruthy();
        expect(arg).toBe('chat123');
      });
      serverSocket.on('leaveChat', arg => {
        expect(io.sockets.adapter.rooms.has('chat123')).toBeFalsy();
        expect(arg).toBe('chat123');
        done();
      });

      clientSocket.emit('joinChat', 'chat123');
      clientSocket.emit('leaveChat', 'chat123');
    });
  });
});
