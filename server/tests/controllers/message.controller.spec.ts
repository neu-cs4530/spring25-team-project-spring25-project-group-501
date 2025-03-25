import mongoose from 'mongoose';
import supertest from 'supertest';
import { app } from '../../app';
import * as messageService from '../../services/message.service';
import * as chatService from '../../services/chat.service';
import * as dbUtil from '../../utils/database.util';
import { DatabaseMessage, Message, DatabaseChat, PopulatedDatabaseChat } from '../../types/types';

// Spy on all service methods used in the controller
const saveMessageSpy = jest.spyOn(messageService, 'saveMessage');
const getMessagesSpy = jest.spyOn(messageService, 'getMessages');
const voteOnPollSpy = jest.spyOn(messageService, 'voteOnPoll');
const getChatSpy = jest.spyOn(chatService, 'getChat');
const populateDocumentSpy = jest.spyOn(dbUtil, 'populateDocument');

describe('Message Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /addMessage', () => {
    it('should add a new message and emit socket event', async () => {
      const validId = new mongoose.Types.ObjectId();

      const requestMessage: Message = {
        msg: 'Hello',
        msgFrom: 'User1',
        msgDateTime: new Date('2024-06-04'),
        type: 'global',
      };

      const message: DatabaseMessage = {
        ...requestMessage,
        _id: validId,
      };

      saveMessageSpy.mockResolvedValue(message);

      const response = await supertest(app)
        .post('/messaging/addMessage')
        .send({ messageToAdd: requestMessage });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        _id: message._id.toString(),
        msg: message.msg,
        msgFrom: message.msgFrom,
        msgDateTime: message.msgDateTime.toISOString(),
        type: 'global',
      });
    });

    it('should return bad request error if messageToAdd is missing', async () => {
      const response = await supertest(app).post('/messaging/addMessage').send({});

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid request');
      expect(saveMessageSpy).not.toHaveBeenCalled();
    });

    it('should return bad message body error if msg is empty', async () => {
      const badMessage = {
        msg: '',
        msgFrom: 'User1',
        msgDateTime: new Date('2024-06-04'),
      };

      const response = await supertest(app)
        .post('/messaging/addMessage')
        .send({ messageToAdd: badMessage });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid message body');
      expect(saveMessageSpy).not.toHaveBeenCalled();
    });

    it('should return bad message body error if msg is missing', async () => {
      const badMessage = {
        msgFrom: 'User1',
        msgDateTime: new Date('2024-06-04'),
      };

      const response = await supertest(app)
        .post('/messaging/addMessage')
        .send({ messageToAdd: badMessage });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid message body');
      expect(saveMessageSpy).not.toHaveBeenCalled();
    });

    it('should return bad message body error if msgFrom is empty', async () => {
      const badMessage = {
        msg: 'Hello',
        msgFrom: '',
        msgDateTime: new Date('2024-06-04'),
      };

      const response = await supertest(app)
        .post('/messaging/addMessage')
        .send({ messageToAdd: badMessage });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid message body');
      expect(saveMessageSpy).not.toHaveBeenCalled();
    });

    it('should return bad message body error if msgFrom is missing', async () => {
      const badMessage = {
        msg: 'Hello',
        msgDateTime: new Date('2024-06-04'),
      };

      const response = await supertest(app)
        .post('/messaging/addMessage')
        .send({ messageToAdd: badMessage });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid message body');
      expect(saveMessageSpy).not.toHaveBeenCalled();
    });

    it('should return bad message body error if msgDateTime is missing', async () => {
      const badMessage = {
        msg: 'Hello',
        msgFrom: 'User1',
      };

      const response = await supertest(app)
        .post('/messaging/addMessage')
        .send({ messageToAdd: badMessage });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid message body');
      expect(saveMessageSpy).not.toHaveBeenCalled();
    });

    it('should return bad message body error if msgDateTime is null', async () => {
      const badMessage = {
        msg: 'Hello',
        msgFrom: 'User1',
        msgDateTime: null,
      };

      const response = await supertest(app)
        .post('/messaging/addMessage')
        .send({ messageToAdd: badMessage });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid message body');
      expect(saveMessageSpy).not.toHaveBeenCalled();
    });

    it('should return internal server error if saveMessage fails', async () => {
      const message = {
        msg: 'Hello',
        msgFrom: 'User1',
        msgDateTime: new Date('2024-06-04'),
      };

      saveMessageSpy.mockResolvedValue({ error: 'Error saving document' });

      const response = await supertest(app)
        .post('/messaging/addMessage')
        .send({ messageToAdd: message });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error when adding a message: Error saving document');
    });

    it('should return 500 if saveMessage throws an exception', async () => {
      const message = {
        msg: 'Hello',
        msgFrom: 'User1',
        msgDateTime: new Date('2024-06-04'),
      };

      saveMessageSpy.mockRejectedValue(new Error('Database connection error'));

      const response = await supertest(app)
        .post('/messaging/addMessage')
        .send({ messageToAdd: message });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error when adding a message: Database connection error');
    });
  });

  describe('GET /getMessages', () => {
    it('should return all messages', async () => {
      const message1: Message = {
        msg: 'Hello',
        msgFrom: 'User1',
        msgDateTime: new Date('2024-06-04'),
        type: 'global',
      };

      const message2: Message = {
        msg: 'Hi',
        msgFrom: 'User2',
        msgDateTime: new Date('2024-06-05'),
        type: 'global',
      };

      const dbMessage1: DatabaseMessage = {
        ...message1,
        _id: new mongoose.Types.ObjectId(),
      };

      const dbMessage2: DatabaseMessage = {
        ...message2,
        _id: new mongoose.Types.ObjectId(),
      };

      getMessagesSpy.mockResolvedValue([dbMessage1, dbMessage2]);

      const response = await supertest(app).get('/messaging/getMessages');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          ...dbMessage1,
          _id: dbMessage1._id.toString(),
          msgDateTime: dbMessage1.msgDateTime.toISOString(),
        },
        {
          ...dbMessage2,
          _id: dbMessage2._id.toString(),
          msgDateTime: dbMessage2.msgDateTime.toISOString(),
        },
      ]);
    });

    it('should return an empty array if no messages exist', async () => {
      getMessagesSpy.mockResolvedValue([]);

      const response = await supertest(app).get('/messaging/getMessages');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('PATCH /voteOnPoll', () => {
    it('should process a vote on a poll and emit socket events', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const messageId = new mongoose.Types.ObjectId().toString();
      const username = 'User1';
      const optionIndex = 1;

      // Mock the updated message after voting
      const updatedMessage: DatabaseMessage = {
        _id: new mongoose.Types.ObjectId(),
        msg: 'Poll Question',
        msgFrom: 'Admin',
        msgDateTime: new Date('2024-06-04'),
        type: 'poll',
        poll: {
          question: 'What is your favorite color?',
          options: [{ optionText: 'Red' }, { optionText: 'Blue' }],
          votes: new Map([['User1', 1]]),
        },
      };

      // Mock the chat data
      const chat: DatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Chat',
        participants: ['Admin', 'User1'],
        messages: [updatedMessage._id],
        permissions: [
          { user: 'Admin', role: 'admin' },
          { user: 'User1', role: 'user' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the populated chat data
      const populatedChat: PopulatedDatabaseChat = {
        ...chat,
        messages: [
          {
            ...updatedMessage,
            user: { _id: new mongoose.Types.ObjectId(), username: 'Admin' },
          },
        ],
      };

      // Setup mocks
      voteOnPollSpy.mockResolvedValue(updatedMessage);
      getChatSpy.mockResolvedValue(chat);
      populateDocumentSpy.mockResolvedValue(populatedChat);

      const response = await supertest(app)
        .patch('/messaging/voteOnPoll')
        .send({ chatID: chatId, messageID: messageId, optionIndex, username });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('poll');
    });

    it('should return 500 if voteOnPoll fails', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const messageId = new mongoose.Types.ObjectId().toString();

      voteOnPollSpy.mockResolvedValue({ error: 'Vote failed' });

      const response = await supertest(app).patch('/messaging/voteOnPoll').send({
        chatID: chatId,
        messageID: messageId,
        optionIndex: 0,
        username: 'User1',
      });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error when voting on a poll: Vote failed');
    });

    it('should return 500 if getChat fails', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const messageId = new mongoose.Types.ObjectId().toString();

      // Mock voteOnPoll to succeed
      const updatedMessage: DatabaseMessage = {
        _id: new mongoose.Types.ObjectId(),
        msg: 'Poll Question',
        msgFrom: 'Admin',
        msgDateTime: new Date('2024-06-04'),
        type: 'poll',
        poll: {
          question: 'What is your favorite color?',
          options: [{ optionText: 'Red' }, { optionText: 'Blue' }],
          votes: new Map([['User1', 0]]),
        },
      };

      voteOnPollSpy.mockResolvedValue(updatedMessage);
      getChatSpy.mockResolvedValue({ error: 'Chat not found' });

      const response = await supertest(app).patch('/messaging/voteOnPoll').send({
        chatID: chatId,
        messageID: messageId,
        optionIndex: 0,
        username: 'User1',
      });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error when voting on a poll: Chat not found');
    });

    it('should return 500 if populateDocument fails', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const messageId = new mongoose.Types.ObjectId().toString();

      // Mock successful responses until populateDocument
      const updatedMessage: DatabaseMessage = {
        _id: new mongoose.Types.ObjectId(),
        msg: 'Poll Question',
        msgFrom: 'Admin',
        msgDateTime: new Date('2024-06-04'),
        type: 'poll',
        poll: {
          question: 'What is your favorite color?',
          options: [{ optionText: 'Red' }, { optionText: 'Blue' }],
          votes: new Map([['User1', 0]]),
        },
      };

      const chat: DatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Chat',
        participants: ['Admin', 'User1'],
        messages: [updatedMessage._id],
        permissions: [
          { user: 'Admin', role: 'admin' },
          { user: 'User1', role: 'user' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      voteOnPollSpy.mockResolvedValue(updatedMessage);
      getChatSpy.mockResolvedValue(chat);
      populateDocumentSpy.mockResolvedValue({ error: 'Population failed' });

      const response = await supertest(app).patch('/messaging/voteOnPoll').send({
        chatID: chatId,
        messageID: messageId,
        optionIndex: 0,
        username: 'User1',
      });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error when voting on a poll: Population failed');
    });

    it('should handle exceptions during the vote process', async () => {
      voteOnPollSpy.mockRejectedValue(new Error('Unexpected error'));

      const response = await supertest(app).patch('/messaging/voteOnPoll').send({
        chatID: 'chatId',
        messageID: 'messageId',
        optionIndex: 0,
        username: 'User1',
      });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error when voting on a poll: Unexpected error');
    });
  });
});
